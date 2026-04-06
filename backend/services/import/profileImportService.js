import { parseGithubProfile } from "./githubParser.js";
import { parseProfilePdf } from "./pdfParser.js";

export function previewGithubImport(payload) {
  return parseGithubProfile(payload?.username);
}

export function previewPdfImport(payload) {
  return parseProfilePdf(payload);
}
