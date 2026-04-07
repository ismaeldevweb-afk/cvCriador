import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";
import { createHttpError } from "../utils/http.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const frontendDir = path.resolve(currentDir, "../../frontend");
const templateRegistryEntry = path.resolve(frontendDir, "src/templates/templateRegistry.js");

let rendererPromise;

async function loadTemplateRenderer() {
  const result = await build({
    absWorkingDir: frontendDir,
    bundle: true,
    entryPoints: [templateRegistryEntry],
    format: "esm",
    loader: {
      ".js": "js",
      ".jsx": "jsx",
    },
    minify: true,
    platform: "node",
    target: "node18",
    write: false,
  });

  const bundledModule = result.outputFiles?.[0]?.text;

  if (!bundledModule) {
    throw createHttpError("Nao foi possivel preparar o renderer seguro dos templates.", 500);
  }

  const tempFile = path.join(os.tmpdir(), `resume-template-renderer-${Date.now()}-${Math.random().toString(36).slice(2)}.mjs`);
  await fs.writeFile(tempFile, bundledModule, "utf8");

  const module = await import(pathToFileURL(tempFile).href);

  if (typeof module.renderResumeDocument !== "function") {
    throw createHttpError("O renderer seguro dos templates nao foi carregado corretamente.", 500);
  }

  return module.renderResumeDocument;
}

export async function renderResumeDocumentOnServer(resume, options = {}) {
  if (!rendererPromise) {
    rendererPromise = loadTemplateRenderer().catch((error) => {
      rendererPromise = null;
      throw error;
    });
  }

  const renderResumeDocument = await rendererPromise;
  return renderResumeDocument(resume, options);
}
