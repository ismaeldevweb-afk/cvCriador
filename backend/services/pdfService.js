import dns from "node:dns/promises";
import net from "node:net";
import puppeteer from "puppeteer";
import { runtimeConfig } from "../config/runtimeConfig.js";
import { createHttpError } from "../utils/http.js";

const MAX_HTML_LENGTH = 1_500_000;
const DNS_LOOKUP_TIMEOUT_MS = 2_000;
const DNS_CACHE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_ALLOWED_IMAGE_HOSTS = ["*.githubusercontent.com", "*.licdn.com"];
const hostnameResolutionCache = new Map();
const allowedImageHostRules = createAllowedImageHostRules();

function buildLaunchArgs(disableSandbox) {
  const args = ["--disable-dev-shm-usage", "--disable-crash-reporter", "--disable-crashpad"];

  if (disableSandbox) {
    args.push("--no-sandbox", "--disable-setuid-sandbox", "--no-zygote");
  }

  return args;
}

function normalizeNetworkToken(value = "") {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/^\[(.*)\]$/, "$1")
    .replace(/%.+$/, "");
}

function normalizeHostRule(value = "") {
  const normalized = normalizeNetworkToken(value).replace(/\.+$/g, "");

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("*.")) {
    return `*.${normalized.slice(2).replace(/^\.+/, "")}`;
  }

  return normalized.replace(/^\.+/, "");
}

export function createAllowedImageHostRules(configuredHosts = runtimeConfig.allowedPdfImageHosts) {
  const source = Array.isArray(configuredHosts)
    ? configuredHosts
    : configuredHosts
      ? configuredHosts.split(",")
      : DEFAULT_ALLOWED_IMAGE_HOSTS;

  return Array.from(new Set(source.map(normalizeHostRule).filter(Boolean)));
}

export function isHostnameInAllowlist(hostname = "", hostRules = allowedImageHostRules) {
  const normalizedHostname = normalizeNetworkToken(hostname).replace(/\.+$/g, "");

  if (!normalizedHostname) {
    return false;
  }

  return hostRules.some((rule) => {
    if (rule.startsWith("*.")) {
      const suffix = rule.slice(2);
      return normalizedHostname !== suffix && normalizedHostname.endsWith(`.${suffix}`);
    }

    return normalizedHostname === rule;
  });
}

function parseIpv4Octets(address = "") {
  const octets = normalizeNetworkToken(address).split(".");

  if (octets.length !== 4) {
    return null;
  }

  const parsed = octets.map((item) => Number.parseInt(item, 10));
  return parsed.every((item) => Number.isInteger(item) && item >= 0 && item <= 255) ? parsed : null;
}

function isBlockedIpv4Address(address = "") {
  const octets = parseIpv4Octets(address);

  if (!octets) {
    return true;
  }

  const [first, second, third] = octets;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0 && third === 0) ||
    (first === 192 && second === 0 && third === 2) ||
    (first === 192 && second === 88 && third === 99) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51 && third === 100) ||
    (first === 203 && second === 0 && third === 113) ||
    first >= 224
  );
}

function expandIpv6Address(address = "") {
  const normalized = normalizeNetworkToken(address);

  if (!normalized || normalized.includes(":::")) {
    return null;
  }

  const mappedIpv4Match = normalized.match(/^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i);
  if (mappedIpv4Match) {
    return {
      mappedIpv4: mappedIpv4Match[1],
    };
  }

  const parts = normalized.split("::");
  if (parts.length > 2) {
    return null;
  }

  const head = parts[0] ? parts[0].split(":").filter(Boolean) : [];
  const tail = parts[1] ? parts[1].split(":").filter(Boolean) : [];
  const missingSegments = parts.length === 2 ? 8 - (head.length + tail.length) : 0;

  if ((parts.length === 1 && head.length !== 8) || (parts.length === 2 && missingSegments < 1) || missingSegments < 0) {
    return null;
  }

  const expanded = [
    ...head,
    ...new Array(missingSegments).fill("0"),
    ...tail,
  ];

  if (expanded.length !== 8 || expanded.some((segment) => !/^[a-f0-9]{1,4}$/i.test(segment))) {
    return null;
  }

  return expanded.map((segment) => Number.parseInt(segment, 16));
}

function isBlockedIpv6Address(address = "") {
  const expanded = expandIpv6Address(address);

  if (!expanded) {
    return true;
  }

  if ("mappedIpv4" in expanded) {
    return isBlockedIpv4Address(expanded.mappedIpv4);
  }

  const [first, second] = expanded;
  const isUnspecified = expanded.every((segment) => segment === 0);
  const isLoopback = expanded.slice(0, 7).every((segment) => segment === 0) && expanded[7] === 1;

  return (
    isUnspecified ||
    isLoopback ||
    (first & 0xfe00) === 0xfc00 ||
    (first & 0xffc0) === 0xfe80 ||
    (first & 0xffc0) === 0xfec0 ||
    (first & 0xff00) === 0xff00 ||
    (first === 0x2001 && second === 0x0db8)
  );
}

export function isBlockedAddress(address = "") {
  const normalized = normalizeNetworkToken(address);

  if (!normalized || normalized === "localhost" || normalized.endsWith(".local")) {
    return true;
  }

  const ipVersion = net.isIP(normalized);
  if (ipVersion === 4) {
    return isBlockedIpv4Address(normalized);
  }

  if (ipVersion === 6) {
    return isBlockedIpv6Address(normalized);
  }

  return false;
}

function getCachedResolution(hostname) {
  const cached = hostnameResolutionCache.get(hostname);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    hostnameResolutionCache.delete(hostname);
    return null;
  }

  return cached.addresses;
}

function setCachedResolution(hostname, addresses) {
  hostnameResolutionCache.set(hostname, {
    addresses,
    expiresAt: Date.now() + DNS_CACHE_TTL_MS,
  });

  return addresses;
}

async function resolveHostnameAddresses(hostname = "") {
  const normalizedHostname = normalizeNetworkToken(hostname);

  if (!normalizedHostname) {
    return [];
  }

  if (net.isIP(normalizedHostname)) {
    return [normalizedHostname];
  }

  const cachedResolution = getCachedResolution(normalizedHostname);
  if (cachedResolution) {
    return cachedResolution;
  }

  let timeoutId;

  try {
    const lookupPromise = dns.lookup(normalizedHostname, {
      all: true,
      verbatim: true,
    }).then((entries) => entries.map((entry) => normalizeNetworkToken(entry.address)).filter(Boolean)).catch(() => []);

    const addresses = await Promise.race([
      lookupPromise,
      new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("DNS_LOOKUP_TIMEOUT")), DNS_LOOKUP_TIMEOUT_MS);
      }),
    ]);

    return setCachedResolution(normalizedHostname, Array.from(new Set(addresses)));
  } catch {
    return [];
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function isSafePdfImageUrl(url, hostRules = allowedImageHostRules) {
  if (url === "about:blank" || url.startsWith("data:")) {
    return true;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch {
    return false;
  }

  if (parsedUrl.protocol !== "https:" || parsedUrl.username || parsedUrl.password) {
    return false;
  }

  if (!isHostnameInAllowlist(parsedUrl.hostname, hostRules)) {
    return false;
  }

  if (isBlockedAddress(parsedUrl.hostname)) {
    return false;
  }

  const resolvedAddresses = await resolveHostnameAddresses(parsedUrl.hostname);
  return resolvedAddresses.length > 0 && resolvedAddresses.every((address) => !isBlockedAddress(address));
}

async function isAllowedRequest(request) {
  if (request.resourceType() !== "image") {
    return false;
  }

  return isSafePdfImageUrl(request.url(), allowedImageHostRules);
}

async function handleInterceptedRequest(request) {
  try {
    if (await isAllowedRequest(request)) {
      await request.continue();
      return;
    }
  } catch {
    // Fall through and abort.
  }

  try {
    await request.abort("blockedbyclient");
  } catch {
    // Ignore secondary interception failures during teardown.
  }
}

export async function generatePdf({ html }) {
  if (!html || typeof html !== "string") {
    throw createHttpError("HTML do curriculo nao informado para gerar o PDF.", 400);
  }

  if (html.length > MAX_HTML_LENGTH) {
    throw createHttpError("O documento ficou grande demais para gerar o PDF com seguranca.", 413);
  }

  const disableSandbox = runtimeConfig.disablePuppeteerSandbox;
  const browser = await puppeteer.launch({
    headless: true,
    args: buildLaunchArgs(disableSandbox),
  });

  try {
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      void handleInterceptedRequest(request);
    });
    page.setDefaultNavigationTimeout(15_000);
    page.setDefaultTimeout(10_000);
    await page.setContent(html, { waitUntil: "domcontentloaded" });

    try {
      await page.waitForNetworkIdle({
        idleTime: 300,
        timeout: 1_500,
      });
    } catch {
      // Best effort only. The document is server-rendered and does not require arbitrary network activity.
    }

    await page.emulateMediaType("screen");

    return await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "18px",
        right: "18px",
        bottom: "18px",
        left: "18px",
      },
    });
  } finally {
    await browser.close();
  }
}
