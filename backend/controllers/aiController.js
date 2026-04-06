import {
  generateSummary,
  improveProfessionalText,
  rewriteCareerObjective,
  suggestSkills,
} from "../services/aiService.js";

export function improveTextHandler(request, response) {
  response.json(improveProfessionalText(request.body));
}

export function generateSummaryHandler(request, response) {
  response.json(generateSummary(request.body));
}

export function suggestSkillsHandler(request, response) {
  response.json(suggestSkills(request.body));
}

export function rewriteObjectiveHandler(request, response) {
  response.json(rewriteCareerObjective(request.body));
}

