import test from "node:test";
import assert from "node:assert/strict";
import { parseGithubProfile, isValidGithubUsername } from "../services/import/githubParser.js";

test("isValidGithubUsername accepts valid public GitHub usernames", () => {
  assert.equal(isValidGithubUsername("octocat"), true);
  assert.equal(isValidGithubUsername("@ismael-dev"), true);
  assert.equal(isValidGithubUsername("user-123"), true);
});

test("isValidGithubUsername rejects path traversal and malformed usernames", () => {
  assert.equal(isValidGithubUsername("../rate_limit"), false);
  assert.equal(isValidGithubUsername("user/name"), false);
  assert.equal(isValidGithubUsername("-octocat"), false);
  assert.equal(isValidGithubUsername("octocat-"), false);
  assert.equal(isValidGithubUsername("octo--cat"), false);
});

test("parseGithubProfile fails fast for invalid usernames before any network call", async () => {
  await assert.rejects(
    () => parseGithubProfile("../rate_limit"),
    (error) => error?.status === 400 && /username publico valido/i.test(error.message),
  );
});
