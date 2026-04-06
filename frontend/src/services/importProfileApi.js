import { apiRequest } from "./apiClient";

const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024;

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => {
      reject(new Error("Nao foi possivel ler o arquivo selecionado."));
    };

    reader.readAsDataURL(file);
  });
}

export const importProfileApi = {
  previewGithub(username) {
    return apiRequest("/import-profile/github", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
  },

  async previewPdf({ file, sourceType }) {
    if (!file) {
      throw new Error("Selecione um PDF para continuar.");
    }

    if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
      throw new Error("Para manter a importacao rapida, envie um PDF com ate 5 MB.");
    }

    const fileContentBase64 = await readFileAsBase64(file);

    return apiRequest("/import-profile/pdf", {
      method: "POST",
      body: JSON.stringify({
        fileName: file.name,
        fileContentBase64,
        sourceType,
      }),
    });
  },
};
