import { apiRequest } from "./apiClient";

export const aiApi = {
  improveText: (payload) =>
    apiRequest("/ai/improve-text", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  generateSummary: (payload) =>
    apiRequest("/ai/generate-summary", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  suggestSkills: (payload) =>
    apiRequest("/ai/suggest-skills", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  rewriteObjective: (payload) =>
    apiRequest("/ai/rewrite-objective", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

