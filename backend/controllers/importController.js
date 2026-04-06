import { previewGithubImport, previewPdfImport } from "../services/import/profileImportService.js";

export async function previewGithubImportHandler(request, response, next) {
  try {
    const result = await previewGithubImport(request.body);
    response.json(result);
  } catch (error) {
    next(error);
  }
}

export async function previewPdfImportHandler(request, response, next) {
  try {
    const result = await previewPdfImport(request.body);
    response.json(result);
  } catch (error) {
    next(error);
  }
}
