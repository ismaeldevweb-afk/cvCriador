import { createRequire } from "node:module";
import { Worker } from "node:worker_threads";
import zlib from "node:zlib";
import { createHttpError } from "../../utils/http.js";
import { createImportResult, sanitizePartialResume, uniqueKeywords } from "./normalizers.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const PDF_PARSE_TIMEOUT_MS = 12_000;
const PDF_PARSE_WORKER_MEMORY_LIMIT_MB = 128;
const ALLOWED_IMPORT_SOURCE_TYPES = new Set(["linkedin_pdf", "resume_pdf"]);
const SECTION_ALIASES = {
  objective: ["objective", "objetivo"],
  summary: ["about", "sobre", "summary", "resumo", "profile", "perfil"],
  experience: ["experience", "experiencia", "experiência", "professional experience", "work experience"],
  education: ["education", "formacao", "formação", "academic background"],
  certifications: ["licenses & certifications", "certifications", "certificacao", "certificacoes", "licencas e certificacoes"],
  skills: ["skills", "competencias", "competências", "top skills", "habilidades"],
  languages: ["languages", "idiomas", "language"],
  projects: ["projects", "projetos"],
  contact: ["contact", "contato", "informacoes de contato", "dados de contato"],
};

function compactText(value = "") {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeHeading(value = "") {
  return compactText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizeLooseText(value = "") {
  return normalizeHeading(value).replace(/\s+/g, " ");
}

function decodePdfString(value = "") {
  return value
    .replace(/\\\\/g, "\\")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(Number.parseInt(octal, 8)));
}

function extractReadableText(value = "") {
  return value.match(/[A-Za-zÀ-ÿ0-9][A-Za-zÀ-ÿ0-9@:/&,+#().%_\- ]{3,}/g) ?? [];
}

function extractLiteralPdfText(value = "") {
  const chunks = [];
  const literalMatches = [
    ...value.matchAll(/\(((?:\\.|[^\\()])*)\)\s*Tj/g),
    ...value.matchAll(/\[(.*?)\]\s*TJ/g),
  ];

  for (const literalMatch of literalMatches) {
    const chunk = decodePdfString(literalMatch[1]).replace(/\s+/g, " ");
    if (compactText(chunk)) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

function isPdfStructuralLine(line = "") {
  return (
    /^%PDF/i.test(line) ||
    /^PDF-\d/i.test(line) ||
    /^%%EOF/i.test(line) ||
    /^\d+\s+\d+\s+obj$/i.test(line) ||
    /\bobj\b/i.test(line) ||
    /^endobj$/i.test(line) ||
    /^stream$/i.test(line) ||
    /\bstream\b/i.test(line) ||
    /^endstream$/i.test(line) ||
    /^trailer/i.test(line) ||
    /^xref$/i.test(line) ||
    /^startxref$/i.test(line) ||
    /<<|>>/.test(line) ||
    /^length\s+\d+/i.test(line)
  );
}

function looksLikePdfMatrixLine(line = "") {
  const tokens = compactText(line).split(/\s+/).filter(Boolean);

  if (tokens.length < 4) {
    return false;
  }

  return tokens.every((token) => /^-?\d+(?:\.\d+)?$/.test(token));
}

function isPdfNoiseLine(line = "") {
  const text = compactText(line);

  if (!text) {
    return true;
  }

  if (looksLikePdfMatrixLine(text)) {
    return true;
  }

  if (/^(?:mcid|cid)\b/i.test(text)) {
    return true;
  }

  if (/^(?:begincmap|endcmap|begincodespacerange|endcodespacerange|beginbfchar|endbfchar|beginbfrange|endbfrange|begincidchar|endcidchar|begincidrange|endcidrange)$/i.test(text)) {
    return true;
  }

  if (/^(?:cidsysteminfo|cmapname|cmaptype|codespacerange|registry|ordering|supplement)$/i.test(text)) {
    return true;
  }

  if (/^(?:cidinit|procset|findresource|defineresource|currentdict)$/i.test(text)) {
    return true;
  }

  if (/^page\s+\d+\s+of\s+\d+$/i.test(text)) {
    return true;
  }

  if (/^\d+\s+of\s+\d+$/i.test(text)) {
    return true;
  }

  if (/^(?:image|artifact|figure|xobject)$/i.test(text)) {
    return true;
  }

  if (/^\/(?:image|xobject|artifact|figure)$/i.test(text)) {
    return true;
  }

  if (/^(?:bt|et|tf|tj|tm|rg|re|q|q1|cm|do|bdc|emc)$/i.test(text)) {
    return true;
  }

  return false;
}

function isPdfNonContentStream(value = "") {
  const text = String(value ?? "");

  return (
    /begincmap/i.test(text) ||
    /endcmap/i.test(text) ||
    /begincodespacerange/i.test(text) ||
    /beginbfchar/i.test(text) ||
    /beginbfrange/i.test(text) ||
    /begincidrange/i.test(text) ||
    /cidsysteminfo/i.test(text) ||
    /cmapname/i.test(text) ||
    /cmaptype/i.test(text) ||
    /cidinit/i.test(text) ||
    /procset\s+findresource/i.test(text) ||
    /defineresource/i.test(text) ||
    /Adobe-Identity-UCS/i.test(text)
  );
}

function isLikelyPhoneCandidate(value = "") {
  const text = compactText(value);
  const digits = text.replace(/\D/g, "");

  if (digits.length < 10 || digits.length > 15) {
    return false;
  }

  if (!/^\+?[\d\s().-]+$/.test(text)) {
    return false;
  }

  if (/\d\.\d/.test(text)) {
    return false;
  }

  return true;
}

function isLinkedInNoiseLine(line = "") {
  const text = normalizeLooseText(line);

  if (!text) {
    return false;
  }

  if (/^\d+\/\d+$/.test(text)) {
    return true;
  }

  if (/^page \d+ of \d+$/.test(text)) {
    return true;
  }

  if (/^experimente pre-?$/.test(text)) {
    return true;
  }

  if (/^mium por r\$ ?0$/.test(text)) {
    return true;
  }

  if (/experimente premium/.test(text) || /premium por r\$ ?0/.test(text)) {
    return true;
  }

  if (/^(teste|trial) gratis do premium/.test(text)) {
    return true;
  }

  if (/^see who viewed your profile$/.test(text)) {
    return true;
  }

  if (/^try premium for/.test(text)) {
    return true;
  }

  return false;
}

function hasUsefulTextSignal(line = "") {
  const text = compactText(line);

  if (!text || isPdfNoiseLine(text) || isPdfStructuralLine(text)) {
    return false;
  }

  if (/[A-Za-zÀ-ÿ]/.test(text)) {
    return true;
  }

  return looksLikePeriodLine(text) || Boolean(extractEmail(text)) || isLikelyPhoneCandidate(text) || extractUrls(text).length > 0;
}

function normalizeExtractedLines(sourceLines = []) {
  const lines = [];
  let previousLine = "";

  for (const fragment of sourceLines) {
    const nextLines = String(fragment ?? "")
      .split(/\r?\n/)
      .map((line) => compactText(line))
      .filter(Boolean)
      .filter((line) => line.length > 1)
      .filter((line) => !/^(bt|et|tf|tj|tm|rg|re|q|q1)$/i.test(line))
      .filter((line) => !/[)\]]\s*TJ?$/i.test(line))
      .filter((line) => hasUsefulTextSignal(line));

    for (const line of nextLines) {
      if (!isPdfStructuralLine(line) && !isPdfNoiseLine(line) && line !== previousLine) {
        lines.push(line);
        previousLine = line;
      }
    }
  }

  return lines;
}

function cleanImportedLines(lines = [], sourceType = "resume_pdf") {
  const cleanedLines = [];
  let previousLine = "";

  for (const line of lines) {
    const nextLine = compactText(line);

    if (!nextLine) {
      continue;
    }

    if (sourceType === "linkedin_pdf" && isLinkedInNoiseLine(nextLine)) {
      continue;
    }

    if (nextLine !== previousLine) {
      cleanedLines.push(nextLine);
      previousLine = nextLine;
    }
  }

  return cleanedLines;
}

async function extractPdfTextWithLibrary(buffer) {
  try {
    const parsed = await pdfParse(buffer);
    const text = String(parsed?.text ?? "");

    if (!compactText(text)) {
      return [];
    }

    return normalizeExtractedLines(text.split(/\r?\n/));
  } catch {
    return [];
  }
}

function extractPdfTextHeuristically(buffer) {
  const binary = buffer.toString("latin1");
  const fragments = [];
  const streamPattern = /stream\r?\n([\s\S]*?)endstream/g;
  let match = streamPattern.exec(binary);

  while (match) {
    const rawStream = Buffer.from(match[1].replace(/^\r?\n/, "").replace(/\r?\n$/, ""), "latin1");

    try {
      const inflated = zlib.inflateSync(rawStream).toString("latin1");

      if (isPdfNonContentStream(inflated)) {
        match = streamPattern.exec(binary);
        continue;
      }

      const literalText = extractLiteralPdfText(inflated);

      if (literalText.length > 0) {
        fragments.push(...literalText);
      } else {
        fragments.push(...extractReadableText(inflated));
      }
    } catch {
      const streamText = rawStream.toString("latin1");

      if (isPdfNonContentStream(streamText)) {
        match = streamPattern.exec(binary);
        continue;
      }

      const literalText = extractLiteralPdfText(streamText);

      if (literalText.length > 0) {
        fragments.push(...literalText);
      } else {
        fragments.push(...extractReadableText(streamText));
      }
    }

    match = streamPattern.exec(binary);
  }

  if (fragments.length === 0) {
    fragments.push(...extractReadableText(binary));
  }

  return normalizeExtractedLines(fragments);
}

function matchSectionKey(line) {
  const normalized = normalizeHeading(line).replace(/[:.]$/, "");
  return Object.entries(SECTION_ALIASES).find(([, aliases]) => aliases.includes(normalized))?.[0] ?? null;
}

function splitIntoSections(lines) {
  const sections = {
    intro: [],
  };
  let currentSection = "intro";

  for (const line of lines) {
    const sectionKey = matchSectionKey(line);
    if (sectionKey) {
      currentSection = sectionKey;
      sections[currentSection] = sections[currentSection] ?? [];
      continue;
    }

    sections[currentSection] = sections[currentSection] ?? [];
    sections[currentSection].push(line);
  }

  return sections;
}

function looksLikePeriodLine(line = "") {
  return /\b(19|20)\d{2}\b/.test(line) || /\b(atual|present)\b/i.test(line);
}

function extractEmail(text = "") {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
}

function extractPhone(text = "") {
  const matches = text.match(/(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,3}\)?[\s.-]?)?\d{4,5}[\s.-]?\d{4}/g) ?? [];
  return matches.find((value) => isLikelyPhoneCandidate(value)) ?? "";
}

function extractUrls(text = "") {
  const rawUrls = uniqueKeywords(text.match(/https?:\/\/[^\s)]+|(?:www\.)[^\s)]+/gi) ?? []);

  return rawUrls
    .map((url) => {
      let nextUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      nextUrl = nextUrl.replace(/([?&]skipRedirect=true)\d+\/\d+$/i, "$1");
      nextUrl = nextUrl.replace(/(?:\s+)?\d+\/\d+$/i, "");
      nextUrl = nextUrl.replace(/[),.;]+$/g, "");

      try {
        const parsed = new URL(nextUrl);

        if (/linkedin\.com$/i.test(parsed.hostname)) {
          const skipRedirect = parsed.searchParams.get("skipRedirect");

          if (skipRedirect && skipRedirect !== "true" && skipRedirect.startsWith("true")) {
            parsed.searchParams.set("skipRedirect", "true");
          }

          nextUrl = parsed.toString();
        }
      } catch {
        return "";
      }

      return nextUrl;
    })
    .filter(Boolean);
}

function looksLikeUrlLine(line = "") {
  return extractUrls(line).length > 0;
}

function extractName(lines = []) {
  return (
    lines.find((line) => {
      if (isPdfNoiseLine(line)) {
        return false;
      }

      if (line.length < 5 || line.length > 60) {
        return false;
      }

      if (/@|https?:\/\/|\d{4}/i.test(line)) {
        return false;
      }

      return /^[A-Za-zÀ-ÿ' -]{5,}$/.test(line);
    }) ?? ""
  );
}

function extractHeadline(lines = [], name = "") {
  const startIndex = Math.max(lines.findIndex((line) => line === name), 0);

  return (
    lines
      .slice(startIndex + 1, startIndex + 6)
      .find(
        (line) =>
          !matchSectionKey(line) &&
          !isPdfNoiseLine(line) &&
          line.length > 6 &&
          !/@|https?:\/\/|\d{4}/i.test(line) &&
          !isLikelyPhoneCandidate(line),
      ) ?? ""
  );
}

function looksLikeDescriptionLine(line = "") {
  const text = compactText(line);

  if (!text) {
    return false;
  }

  if (/[.!?;:]$/.test(text)) {
    return true;
  }

  if (text.split(/\s+/).length >= 9) {
    return true;
  }

  return /^(liderei|atuei|desenvolvi|criei|implementei|responsavel|responsável|planejei|gerenciei|built|led|developed|created|implemented|designed|responsible)\b/i.test(text);
}

function looksLikeLocationLine(line = "") {
  const text = compactText(line);

  if (!text) {
    return false;
  }

  if (/^(remote|remoto|hybrid|hibrido|híbrido|on-site|onsite|presencial)$/i.test(text)) {
    return true;
  }

  if (!text.includes(",")) {
    return false;
  }

  const parts = text.split(",").map((part) => compactText(part)).filter(Boolean);

  if (parts.length < 2 || parts.length > 4) {
    return false;
  }

  return parts.every((part) => /^[A-ZÀ-Ý][A-Za-zÀ-ÿ' -]{1,}$/.test(part));
}

function looksLikeEntryHeading(line = "") {
  const text = compactText(line);

  if (!text) {
    return false;
  }

  if (looksLikePeriodLine(text) || looksLikeUrlLine(text) || extractEmail(text) || extractPhone(text)) {
    return false;
  }

  if (looksLikeDescriptionLine(text)) {
    return false;
  }

  if (text.split(/\s+/).length > 8) {
    return false;
  }

  return /^[A-ZÀ-Ý0-9]/.test(text);
}

function pushBlock(blocks, lines = []) {
  const block = lines.map((line) => compactText(line)).filter(Boolean);

  if (block.length > 0) {
    blocks.push(block);
  }
}

function splitTimedBlocks(lines = []) {
  const blocks = [];
  let currentBlock = [];
  let currentHasPeriod = false;

  for (const line of lines) {
    const nextLine = compactText(line);

    if (!nextLine) {
      continue;
    }

    const isBoundary =
      currentBlock.length >= 2 &&
      currentHasPeriod &&
      looksLikeEntryHeading(nextLine);

    if (isBoundary) {
      pushBlock(blocks, currentBlock);
      currentBlock = [nextLine];
      currentHasPeriod = looksLikePeriodLine(nextLine);
      continue;
    }

    currentBlock.push(nextLine);
    currentHasPeriod = currentHasPeriod || looksLikePeriodLine(nextLine);
  }

  pushBlock(blocks, currentBlock);

  return blocks.filter((block) => block.some(Boolean));
}

function looksLikeUpcomingTimedEntry(lines = [], index = 0) {
  const currentLine = compactText(lines[index] ?? "");
  const nextLine = compactText(lines[index + 1] ?? "");

  if (!currentLine || !nextLine) {
    return false;
  }

  if (!looksLikeEntryHeading(currentLine) || looksLikeLocationLine(currentLine)) {
    return false;
  }

  if (looksLikePeriodLine(nextLine) || looksLikeDescriptionLine(nextLine) || looksLikeLocationLine(nextLine)) {
    return false;
  }

  return lines
    .slice(index + 1, index + 4)
    .some((line) => looksLikePeriodLine(compactText(line)));
}

function splitLinkedInTimedBlocks(lines = []) {
  const blocks = [];
  let currentBlock = [];
  let currentHasPeriod = false;

  for (let index = 0; index < lines.length; index += 1) {
    const nextLine = compactText(lines[index]);

    if (!nextLine) {
      continue;
    }

    const isBoundary =
      currentBlock.length >= 2 &&
      currentHasPeriod &&
      looksLikeUpcomingTimedEntry(lines, index);

    if (isBoundary) {
      pushBlock(blocks, currentBlock);
      currentBlock = [nextLine];
      currentHasPeriod = looksLikePeriodLine(nextLine);
      continue;
    }

    currentBlock.push(nextLine);
    currentHasPeriod = currentHasPeriod || looksLikePeriodLine(nextLine);
  }

  pushBlock(blocks, currentBlock);

  return blocks.filter((block) => block.some(Boolean));
}

function splitProjectBlocks(lines = []) {
  const blocks = [];
  let currentBlock = [];
  let currentHasUrl = false;
  let currentHasDescription = false;

  for (const line of lines) {
    const nextLine = compactText(line);

    if (!nextLine) {
      continue;
    }

    const isBoundary =
      currentBlock.length >= 2 &&
      looksLikeEntryHeading(nextLine) &&
      (currentHasUrl || (currentHasDescription && currentBlock.length >= 3));

    if (isBoundary) {
      pushBlock(blocks, currentBlock);
      currentBlock = [nextLine];
      currentHasUrl = looksLikeUrlLine(nextLine);
      currentHasDescription = looksLikeDescriptionLine(nextLine);
      continue;
    }

    currentBlock.push(nextLine);
    currentHasUrl = currentHasUrl || looksLikeUrlLine(nextLine);
    currentHasDescription = currentHasDescription || looksLikeDescriptionLine(nextLine);
  }

  pushBlock(blocks, currentBlock);

  return blocks.filter((block) => block.some(Boolean));
}

function extractPeriod(block = []) {
  return block.find((line) => looksLikePeriodLine(line)) ?? "";
}

function extractYearToken(line = "") {
  return line.match(/\b(19|20)\d{2}\b/) ? line.match(/\b(19|20)\d{2}\b/)[0] : "";
}

function parseExperience(lines = [], sourceType = "resume_pdf") {
  const blocks = sourceType === "linkedin_pdf" ? splitLinkedInTimedBlocks(lines) : splitTimedBlocks(lines);

  return blocks
    .slice(0, 8)
    .map((block) => {
      const period = extractPeriod(block);
      const contentLines = block.filter((line) => line !== period);
      const [role = "", company = ""] = contentLines;
      const description = contentLines
        .slice(2)
        .filter((line) => !looksLikeLocationLine(line))
        .join(" ");

      return {
        role: compactText(role),
        company: compactText(company),
        period: compactText(period),
        description: compactText(description),
      };
    })
    .filter((item) => item.role || item.company || item.description);
}

function parseEducation(lines = [], sourceType = "resume_pdf") {
  const blocks = sourceType === "linkedin_pdf" ? splitLinkedInTimedBlocks(lines) : splitTimedBlocks(lines);

  return blocks
    .slice(0, 6)
    .map((block) => {
      const period = extractPeriod(block);
      const contentLines = block.filter((line) => line !== period);
      const [first = "", second = ""] = contentLines;
      const course = sourceType === "linkedin_pdf" ? second : first;
      const institution = sourceType === "linkedin_pdf" ? first : second;

      return {
        course: compactText(course),
        institution: compactText(institution),
        period: compactText(period),
      };
    })
    .filter((item) => item.course || item.institution);
}

function parseCertifications(lines = [], sourceType = "resume_pdf") {
  if (sourceType === "linkedin_pdf") {
    const blocks = [];
    let currentBlock = [];

    for (const line of lines) {
      const nextLine = compactText(line);

      if (!nextLine) {
        continue;
      }

      currentBlock.push(nextLine);

      if (extractYearToken(nextLine) || /^issued\b/i.test(nextLine)) {
        pushBlock(blocks, currentBlock);
        currentBlock = [];
      }
    }

    pushBlock(blocks, currentBlock);

    return blocks
      .slice(0, 8)
      .map((block) => {
        const yearLine = block.find((line) => extractYearToken(line) || /^issued\b/i.test(line)) ?? "";
        const year = extractYearToken(yearLine);
        const contentLines = block.filter((line) => line !== yearLine);
        const [name = "", issuer = ""] = contentLines;

        return {
          name: compactText(name),
          issuer: compactText(issuer),
          year: compactText(year),
        };
      })
      .filter((item) => item.name || item.issuer);
  }

  return splitTimedBlocks(lines)
    .slice(0, 8)
    .map((block) => {
      const year = block.find((line) => extractYearToken(line)) ?? "";
      const [name = "", issuer = ""] = block.filter((line) => line !== year);

      return {
        name: compactText(name),
        issuer: compactText(issuer),
        year: compactText(extractYearToken(year)),
      };
    })
    .filter((item) => item.name || item.issuer);
}

function parseLanguages(lines = []) {
  return uniqueKeywords(
    lines.flatMap((line) =>
      line.split(/[•,|/]/).map((token) => compactText(token)).filter(Boolean),
    ),
  ).slice(0, 8).map((name) => ({
    name,
    level: "",
  }));
}

function parseSkills(lines = []) {
  return uniqueKeywords(
    lines.flatMap((line) =>
      line.split(/[•,|/]/).map((token) => compactText(token)).filter(Boolean),
    ),
  ).slice(0, 16);
}

function parseProjects(lines = []) {
  return splitProjectBlocks(lines)
    .slice(0, 6)
    .map((block) => {
      const link = extractUrls(block.join("\n"))[0] ?? "";
      const contentLines = block.filter((line) => !looksLikeUrlLine(line));
      const [name = "", secondLine = ""] = contentLines;
      const description = contentLines.slice(2).join(" ");

      return {
        name: compactText(name),
        technologies: compactText(secondLine),
        description: compactText(description),
        link: compactText(link),
      };
    })
    .filter((item) => item.name || item.description || item.link);
}

function buildPdfObjective(sections) {
  if ((sections.objective ?? []).length > 0) {
    return compactText(sections.objective.join(" "));
  }

  return "";
}

function selectProfileUrl(urls = [], provider) {
  return urls.find((url) => {
    if (provider === "linkedin") {
      return /linkedin\.com\/(in|pub|company)\//i.test(url);
    }

    if (provider === "github") {
      const match = url.match(/^https?:\/\/(?:www\.)?github\.com\/([^/?#]+)(?:\/)?$/i);
      return Boolean(match?.[1]);
    }

    return false;
  }) ?? "";
}

function buildPdfSummary(sections, headline = "") {
  if ((sections.summary ?? []).length > 0) {
    return compactText(sections.summary.join(" "));
  }

  return compactText(headline);
}

function createPreviewSection({
  key,
  label,
  count = 0,
  preview = [],
  priority = "secondary",
  confidence = "medium",
  recommended = true,
  reason = "",
}) {
  return {
    key,
    label,
    count,
    preview: uniqueKeywords(preview).slice(0, 4),
    priority,
    confidence,
    recommended,
    ...(reason ? { reason } : {}),
  };
}

function isTrustedConfidence(value = "") {
  return value === "high" || value === "medium";
}

function getConfidenceWeight(value = "") {
  if (value === "high") {
    return 3;
  }

  if (value === "medium") {
    return 2;
  }

  return 1;
}

function summarizeConfidence(values = []) {
  const weights = values.map((value) => getConfidenceWeight(value));

  if (weights.length === 0) {
    return "low";
  }

  const average = weights.reduce((sum, value) => sum + value, 0) / weights.length;

  if (average >= 2.6) {
    return "high";
  }

  if (average >= 1.8) {
    return "medium";
  }

  return "low";
}

function buildEntryPreview({ role = "", company = "", period = "", description = "" } = {}) {
  return [role, company, period].filter(Boolean).join(" • ") || compactText(description);
}

function buildEducationEntryPreview({ course = "", institution = "", period = "" } = {}) {
  return [course, institution, period].filter(Boolean).join(" • ");
}

function buildCertificationEntryPreview({ name = "", issuer = "", year = "" } = {}) {
  return [name, issuer, year].filter(Boolean).join(" • ");
}

function extractLinkedInLocation(lines = [], fullName = "", headline = "") {
  return (
    lines.find((line) => {
      const text = compactText(line);

      if (!text || text === fullName || text === headline) {
        return false;
      }

      if (matchSectionKey(text) || looksLikeUrlLine(text) || extractEmail(text) || extractPhone(text)) {
        return false;
      }

      return looksLikeLocationLine(text);
    }) ?? ""
  );
}

function sanitizeLinkedInPdfText(lines = []) {
  const normalizedCounts = new Map();

  for (const line of lines) {
    const normalized = normalizeLooseText(line);

    if (!normalized) {
      continue;
    }

    normalizedCounts.set(normalized, (normalizedCounts.get(normalized) ?? 0) + 1);
  }

  const discardedLines = [];
  const cleanLines = [];
  let previousLine = "";

  for (const line of lines) {
    const text = compactText(line);
    const normalized = normalizeLooseText(text);
    const recurringCount = normalizedCounts.get(normalized) ?? 0;

    if (!text) {
      continue;
    }

    const shouldDiscard =
      isLinkedInNoiseLine(text) ||
      looksLikeUrlLine(text) ||
      /skipredirect\s*=\s*true/i.test(normalized) ||
      /linkedin\.com\//i.test(normalized) ||
      /(?:^| )r\$ ?\d/i.test(normalized) ||
      /(?:^| )us\$ ?\d/i.test(normalized) ||
      /premium/i.test(normalized) ||
      (/^\d+\/\d+$/.test(normalized) && recurringCount >= 1) ||
      (recurringCount >= 2 && (isLinkedInNoiseLine(text) || /linkedin/i.test(normalized)));

    if (shouldDiscard) {
      discardedLines.push(text);
      continue;
    }

    if (text !== previousLine) {
      cleanLines.push(text);
      previousLine = text;
    }
  }

  return {
    cleanLines,
    discardedLines: uniqueKeywords(discardedLines),
    profileUrls: extractUrls(lines.join("\n")),
  };
}

function scorePersonalConfidence(personal = {}) {
  if (personal.fullName && personal.role) {
    return "high";
  }

  if (personal.fullName || personal.role || personal.email || personal.phone || personal.city) {
    return "medium";
  }

  return "low";
}

function scoreSummaryConfidence(summary = "") {
  const text = compactText(summary);

  if (!text || looksLikeUrlLine(text) || isLinkedInNoiseLine(text)) {
    return "low";
  }

  if (text.length >= 80) {
    return "high";
  }

  if (text.length >= 28) {
    return "medium";
  }

  return "low";
}

function scoreExperienceEntry(entry = {}) {
  const fields = [entry.role, entry.company, entry.period, entry.description].filter((value) => compactText(value));

  if (fields.some((value) => looksLikeUrlLine(value) || isLinkedInNoiseLine(value))) {
    return "low";
  }

  if (entry.role && entry.company && entry.period) {
    return "high";
  }

  if (fields.length >= 2) {
    return "medium";
  }

  return "low";
}

function scoreEducationEntry(entry = {}) {
  const fields = [entry.course, entry.institution, entry.period].filter((value) => compactText(value));

  if (entry.course && entry.institution) {
    return entry.period ? "high" : "medium";
  }

  if (fields.length >= 2) {
    return "medium";
  }

  return "low";
}

function scoreCertificationEntry(entry = {}) {
  if (entry.name && entry.issuer && entry.year) {
    return "high";
  }

  if (entry.name && (entry.issuer || entry.year)) {
    return "medium";
  }

  return entry.name ? "medium" : "low";
}

function scoreListConfidence(items = [], highThreshold = 4) {
  if (items.length >= highThreshold) {
    return "high";
  }

  if (items.length > 0) {
    return "medium";
  }

  return "low";
}

function buildLinkedInImportPreview({
  lines,
  parser,
  fileName,
}) {
  const { cleanLines, discardedLines, profileUrls } = sanitizeLinkedInPdfText(lines);

  if (cleanLines.length === 0) {
    throw createHttpError("Nao foi possivel detectar conteudo util no LinkedIn PDF apos a limpeza do texto.", 422);
  }

  const semanticBlocks = splitIntoSections(cleanLines);
  const fullName = extractName(cleanLines);
  const headline = extractHeadline(cleanLines, fullName);
  const city = extractLinkedInLocation(semanticBlocks.intro ?? [], fullName, headline);
  const aboutSummary = compactText((semanticBlocks.summary ?? []).join(" "));
  const experienceEntries = parseExperience(semanticBlocks.experience ?? [], "linkedin_pdf");
  const educationEntries = parseEducation(semanticBlocks.education ?? [], "linkedin_pdf");
  const certificationEntries = parseCertifications(semanticBlocks.certifications ?? [], "linkedin_pdf");
  const skills = parseSkills(semanticBlocks.skills ?? []).filter((item) => !looksLikeUrlLine(item) && !isLinkedInNoiseLine(item));
  const languages = parseLanguages(semanticBlocks.languages ?? []).filter((item) => compactText(item.name));
  const linkedinUrl = selectProfileUrl(profileUrls, "linkedin");
  const email = extractEmail(cleanLines.join("\n"));
  const phone = extractPhone(cleanLines.join("\n"));

  const personalCandidate = {
    fullName,
    role: headline,
    city,
    email,
    phone,
    linkedin: linkedinUrl,
  };

  const sections = [];
  const suspiciousSections = [];
  const normalizedResume = {};

  const personalConfidence = scorePersonalConfidence(personalCandidate);
  const personalPreview = [fullName, headline, city, email, phone].filter(Boolean);

  if (isTrustedConfidence(personalConfidence) && personalPreview.length > 0) {
    normalizedResume.title = fullName ? `Curriculo ${fullName}` : compactText(fileName.replace(/\.pdf$/i, ""));
    normalizedResume.personal = {
      ...personalCandidate,
    };
    sections.push(
      createPreviewSection({
        key: "personal",
        label: "Dados principais",
        count: personalPreview.length + (normalizedResume.title ? 1 : 0),
        preview: personalPreview,
        priority: "primary",
        confidence: personalConfidence,
      }),
    );
  } else if (personalPreview.length > 0) {
    suspiciousSections.push(
      createPreviewSection({
        key: "personal_suspect",
        label: "Dados principais suspeitos",
        count: personalPreview.length,
        preview: personalPreview,
        priority: "secondary",
        confidence: "low",
        recommended: false,
        reason: "Bloco com baixa confianca nao sera aplicado automaticamente.",
      }),
    );
  }

  const summaryConfidence = scoreSummaryConfidence(aboutSummary);
  if (isTrustedConfidence(summaryConfidence)) {
    normalizedResume.summary = aboutSummary;
    sections.push(
      createPreviewSection({
        key: "summary",
        label: "Resumo profissional",
        count: 1,
        preview: [aboutSummary.slice(0, 180)],
        priority: "primary",
        confidence: summaryConfidence,
      }),
    );
  } else if (aboutSummary) {
    suspiciousSections.push(
      createPreviewSection({
        key: "summary_suspect",
        label: "Resumo suspeito",
        count: 1,
        preview: [aboutSummary.slice(0, 180)],
        priority: "secondary",
        confidence: "low",
        recommended: false,
        reason: "Resumo curto ou ambiguo foi mantido fora do preenchimento automatico.",
      }),
    );
  }

  const scoredExperience = experienceEntries.map((entry) => ({
    entry,
    confidence: scoreExperienceEntry(entry),
  }));
  const trustedExperience = scoredExperience.filter((item) => isTrustedConfidence(item.confidence)).map((item) => item.entry);
  const suspiciousExperience = scoredExperience.filter((item) => !isTrustedConfidence(item.confidence)).map((item) => item.entry);

  if (trustedExperience.length > 0) {
    normalizedResume.experience = trustedExperience;
    sections.push(
      createPreviewSection({
        key: "experience",
        label: "Experiencia profissional",
        count: trustedExperience.length,
        preview: trustedExperience.map((entry) => buildEntryPreview(entry)),
        priority: "primary",
        confidence: summarizeConfidence(scoredExperience.filter((item) => isTrustedConfidence(item.confidence)).map((item) => item.confidence)),
      }),
    );
  }

  if (suspiciousExperience.length > 0) {
    suspiciousSections.push(
      createPreviewSection({
        key: "experience_suspect",
        label: "Experiencia suspeita",
        count: suspiciousExperience.length,
        preview: suspiciousExperience.map((entry) => buildEntryPreview(entry)),
        priority: "secondary",
        confidence: "low",
        recommended: false,
        reason: "Blocos incompletos ou com estrutura ambigua ficaram fora da importacao automatica.",
      }),
    );
  }

  const scoredEducation = educationEntries.map((entry) => ({
    entry,
    confidence: scoreEducationEntry(entry),
  }));
  const trustedEducation = scoredEducation.filter((item) => isTrustedConfidence(item.confidence)).map((item) => item.entry);
  const suspiciousEducation = scoredEducation.filter((item) => !isTrustedConfidence(item.confidence)).map((item) => item.entry);

  if (trustedEducation.length > 0) {
    normalizedResume.education = trustedEducation;
    sections.push(
      createPreviewSection({
        key: "education",
        label: "Formacao",
        count: trustedEducation.length,
        preview: trustedEducation.map((entry) => buildEducationEntryPreview(entry)),
        priority: "primary",
        confidence: summarizeConfidence(scoredEducation.filter((item) => isTrustedConfidence(item.confidence)).map((item) => item.confidence)),
      }),
    );
  }

  if (suspiciousEducation.length > 0) {
    suspiciousSections.push(
      createPreviewSection({
        key: "education_suspect",
        label: "Formacao suspeita",
        count: suspiciousEducation.length,
        preview: suspiciousEducation.map((entry) => buildEducationEntryPreview(entry)),
        priority: "secondary",
        confidence: "low",
        recommended: false,
        reason: "Itens incompletos de formacao ficaram fora do preenchimento automatico.",
      }),
    );
  }

  const scoredCertifications = certificationEntries.map((entry) => ({
    entry,
    confidence: scoreCertificationEntry(entry),
  }));
  const trustedCertifications = scoredCertifications.filter((item) => isTrustedConfidence(item.confidence)).map((item) => item.entry);
  const suspiciousCertifications = scoredCertifications.filter((item) => !isTrustedConfidence(item.confidence)).map((item) => item.entry);

  if (trustedCertifications.length > 0) {
    normalizedResume.certifications = trustedCertifications;
    sections.push(
      createPreviewSection({
        key: "certifications",
        label: "Certificacoes",
        count: trustedCertifications.length,
        preview: trustedCertifications.map((entry) => buildCertificationEntryPreview(entry)),
        priority: "primary",
        confidence: summarizeConfidence(scoredCertifications.filter((item) => isTrustedConfidence(item.confidence)).map((item) => item.confidence)),
      }),
    );
  }

  if (suspiciousCertifications.length > 0) {
    suspiciousSections.push(
      createPreviewSection({
        key: "certifications_suspect",
        label: "Certificacoes suspeitas",
        count: suspiciousCertifications.length,
        preview: suspiciousCertifications.map((entry) => buildCertificationEntryPreview(entry)),
        priority: "secondary",
        confidence: "low",
        recommended: false,
        reason: "Certificacoes incompletas nao entram automaticamente no editor.",
      }),
    );
  }

  const skillsConfidence = scoreListConfidence(skills, 3);
  if (isTrustedConfidence(skillsConfidence)) {
    normalizedResume.skills = skills;
    sections.push(
      createPreviewSection({
        key: "skills",
        label: "Competencias",
        count: skills.length,
        preview: skills,
        priority: "primary",
        confidence: skillsConfidence,
      }),
    );
  }

  const languagesConfidence = scoreListConfidence(languages, 2);
  if (isTrustedConfidence(languagesConfidence)) {
    normalizedResume.languages = languages;
    sections.push(
      createPreviewSection({
        key: "languages",
        label: "Idiomas",
        count: languages.length,
        preview: languages.map((item) => item.name),
        priority: "secondary",
        confidence: languagesConfidence,
      }),
    );
  }

  if (discardedLines.length > 0) {
    suspiciousSections.push(
      createPreviewSection({
        key: "linkedin_noise",
        label: "Blocos suspeitos",
        count: discardedLines.length,
        preview: discardedLines,
        priority: "secondary",
        confidence: "low",
        recommended: false,
        reason: "Texto promocional, navegacao, URLs e paginação foram removidos do preenchimento automatico.",
      }),
    );
  }

  return createImportResult({
    sourceType: "linkedin_pdf",
    sourceLabel: "LinkedIn PDF",
    normalizedResume: sanitizePartialResume(normalizedResume),
    parser,
    sections,
    suspiciousSections,
    notes: [
      parser === "pdf-parse"
        ? "A importacao de PDF usou extracao textual dedicada e foi preparada para revisao antes de aplicar no editor."
        : "A importacao de PDF usou fallback heuristico de texto e foi preparada para revisao antes de aplicar no editor.",
      "LinkedIn PDF passou por limpeza de ruído, segmentacao semantica e score de confianca antes do preview.",
      "LinkedIn PDF tem prioridade para experiencia, formacao e competencias.",
    ],
    warnings: suspiciousSections.length > 0
      ? ["Alguns blocos foram marcados como suspeitos e ficaram fora do preenchimento automatico."]
      : ["Revise cargos, periodos e blocos longos antes de concluir a importacao."],
    meta: {
      sanitizer: "linkedin-pdf-v2",
      discardedLineCount: discardedLines.length,
      suspiciousSectionCount: suspiciousSections.length,
      validSectionCount: sections.length,
    },
  });
}

export async function parseProfilePdfInProcess({
  fileName = "",
  fileContentBase64 = "",
  sourceType = "resume_pdf",
} = {}) {
  if (typeof fileContentBase64 !== "string" || !fileContentBase64.trim()) {
    throw createHttpError("Envie um PDF para continuar.", 400);
  }

  if (!ALLOWED_IMPORT_SOURCE_TYPES.has(sourceType)) {
    throw createHttpError("Tipo de importacao de PDF nao suportado.", 400);
  }

  const pdfBuffer = Buffer.from(fileContentBase64, "base64");

  if (!pdfBuffer.length) {
    throw createHttpError("Nao foi possivel ler o arquivo enviado.", 400);
  }

  if (pdfBuffer.length > MAX_IMPORT_FILE_SIZE_BYTES) {
    throw createHttpError("Para manter a importacao rapida, envie um PDF com ate 5 MB.", 413);
  }

  let lines = await extractPdfTextWithLibrary(pdfBuffer);
  let parser = "pdf-parse";

  if (lines.length === 0) {
    lines = extractPdfTextHeuristically(pdfBuffer);
    parser = "heuristic-pdf-text";
  }

  if (lines.length === 0) {
    throw createHttpError("Nao foi possivel extrair texto desse PDF. Tente um arquivo com texto selecionavel.", 422);
  }

  if (sourceType === "linkedin_pdf") {
    return buildLinkedInImportPreview({
      lines,
      parser,
      fileName,
    });
  }

  lines = cleanImportedLines(lines, sourceType);

  const text = lines.join("\n");
  const sections = splitIntoSections(lines);
  const name = extractName(lines);
  const headline = extractHeadline(lines, name);
  const profileText = [...(sections.intro ?? []), ...(sections.contact ?? [])].join("\n");
  const profileUrls = extractUrls(profileText);
  const linkedinUrl = selectProfileUrl(profileUrls, "linkedin");
  const githubUrl = selectProfileUrl(profileUrls, "github");
  const portfolioUrl = profileUrls.find((url) => !/linkedin\.com|github\.com/i.test(url)) ?? "";

  const normalizedResume = sanitizePartialResume({
    title: name ? `Curriculo ${name}` : compactText(fileName.replace(/\.pdf$/i, "")),
    personal: {
      fullName: name,
      role: headline,
      objective: buildPdfObjective(sections),
      email: extractEmail(text),
      phone: extractPhone(text),
      linkedin: linkedinUrl,
      github: githubUrl,
      portfolio: portfolioUrl,
    },
    summary: buildPdfSummary(sections, headline),
    experience: parseExperience(sections.experience ?? [], sourceType),
    education: parseEducation(sections.education ?? [], sourceType),
    certifications: parseCertifications(sections.certifications ?? [], sourceType),
    skills: parseSkills(sections.skills ?? []),
    languages: parseLanguages(sections.languages ?? []),
    projects: parseProjects(sections.projects ?? []),
    additionalInfo: sourceType === "linkedin_pdf" ? "" : compactText((sections.contact ?? []).join(" ")),
  });

  return createImportResult({
    sourceType,
    sourceLabel: sourceType === "linkedin_pdf" ? "LinkedIn PDF" : "Curriculo em PDF",
    normalizedResume,
    parser,
    notes: [
      parser === "pdf-parse"
        ? "A importacao de PDF usou extracao textual dedicada e foi preparada para revisao antes de aplicar no editor."
        : "A importacao de PDF usou fallback heuristico de texto e foi preparada para revisao antes de aplicar no editor.",
      sourceType === "linkedin_pdf"
        ? "LinkedIn PDF tem prioridade para experiencia, formacao e competencias."
        : "Curriculo em PDF tem prioridade para reaproveitamento textual e migracao para templates melhores.",
    ],
    warnings: [
      "Revise cargos, periodos e blocos longos antes de concluir a importacao.",
    ],
  });
}

export function parseProfilePdf(payload = {}) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const worker = new Worker(new URL("./pdfParserWorker.js", import.meta.url), {
      execArgv: process.execArgv.filter((value) => !value.startsWith("--input-type")),
      resourceLimits: {
        maxOldGenerationSizeMb: PDF_PARSE_WORKER_MEMORY_LIMIT_MB,
      },
      workerData: payload,
    });

    const finish = (callback) => (value) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      callback(value);
    };

    const resolveOnce = finish(resolve);
    const rejectOnce = finish(reject);

    const timeoutId = setTimeout(() => {
      void worker.terminate().catch(() => {});
      rejectOnce(
        createHttpError(
          "O PDF demorou demais para ser processado com seguranca. Tente um arquivo menor ou com menos paginas.",
          408,
        ),
      );
    }, PDF_PARSE_TIMEOUT_MS);

    worker.once("message", (message) => {
      void worker.terminate().catch(() => {});

      if (message?.ok) {
        resolveOnce(message.result);
        return;
      }

      rejectOnce(
        createHttpError(
          message?.error?.message ?? "Falha ao processar o PDF enviado.",
          message?.error?.status ?? 422,
        ),
      );
    });

    worker.once("error", () => {
      void worker.terminate().catch(() => {});
      rejectOnce(createHttpError("Falha ao processar o PDF com seguranca.", 500));
    });

    worker.once("exit", (code) => {
      if (settled || code === 0) {
        return;
      }

      rejectOnce(createHttpError("O processo de leitura do PDF foi interrompido antes de concluir.", 500));
    });
  });
}
