import test from "node:test";
import assert from "node:assert/strict";
import {
  createAllowedImageHostRules,
  isBlockedAddress,
  isHostnameInAllowlist,
  isSafePdfImageUrl,
} from "../services/pdfService.js";

test("createAllowedImageHostRules normalizes explicit and wildcard hosts", () => {
  const rules = createAllowedImageHostRules(" avatars.githubusercontent.com , *.licdn.com,*.licdn.com ");

  assert.deepEqual(rules, ["avatars.githubusercontent.com", "*.licdn.com"]);
});

test("isHostnameInAllowlist matches explicit and wildcard rules only", () => {
  const rules = createAllowedImageHostRules("avatars.githubusercontent.com,*.licdn.com");

  assert.equal(isHostnameInAllowlist("avatars.githubusercontent.com", rules), true);
  assert.equal(isHostnameInAllowlist("media.licdn.com", rules), true);
  assert.equal(isHostnameInAllowlist("licdn.com", rules), false);
  assert.equal(isHostnameInAllowlist("example.com", rules), false);
});

test("isBlockedAddress rejects private and loopback addresses", () => {
  assert.equal(isBlockedAddress("127.0.0.1"), true);
  assert.equal(isBlockedAddress("10.0.0.7"), true);
  assert.equal(isBlockedAddress("::1"), true);
  assert.equal(isBlockedAddress("fd00::1"), true);
});

test("isSafePdfImageUrl allows data URLs for inline images", async () => {
  const allowed = await isSafePdfImageUrl("data:image/png;base64,AAAA");
  assert.equal(allowed, true);
});

test("isSafePdfImageUrl rejects non-https URLs and private IPs even if allowlisted", async () => {
  assert.equal(await isSafePdfImageUrl("http://avatars.githubusercontent.com/u/1"), false);
  assert.equal(await isSafePdfImageUrl("https://user:pass@avatars.githubusercontent.com/u/1"), false);
  assert.equal(await isSafePdfImageUrl("https://127.0.0.1/avatar.png", ["127.0.0.1"]), false);
});
