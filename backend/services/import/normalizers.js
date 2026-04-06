import { createHttpError } from "../../utils/http.js";

function compactText(value = "") {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function uniqueList(items = []) {
  return Array.from(new Set(items.map((item) => compactText(item)).filter(Boolean)));
}

function pickNonEmptyFields(source = {}) {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => compactText(value)),
  );
}

function countObjectValues(source = {}) {
  return Object.values(source).filter((value) => compactText(value)).length;
}

function buildProjectPreview(items = []) {
  return items.slice(0, 2).map((item) => {
    const headline = [item.name, item.technologies].filter(Boolean).join(" • ");
    return headline || item.description || item.link;
  });
}

function buildExperiencePreview(items = []) {
  return items.slice(0, 2).map((item) => {
    const headline = [item.role, item.company].filter(Boolean).join(" • ");
    return headline || item.description || item.period;
  });
}

function buildEducationPreview(items = []) {
  return items.slice(0, 2).map((item) => {
    const headline = [item.course, item.institution].filter(Boolean).join(" • ");
    return headline || item.period;
  });
}

function buildCertificationPreview(items = []) {
  return items.slice(0, 2).map((item) => {
    const headline = [item.name, item.issuer, item.year].filter(Boolean).join(" • ");
    return headline;
  });
}

const sourceSectionPriority = {
  github: {
    personal: "secondary",
    summary: "secondary",
    skills: "primary",
    projects: "primary",
  },
  linkedin_pdf: {
    personal: "primary",
    summary: "primary",
    experience: "primary",
    education: "primary",
    certifications: "primary",
    skills: "primary",
    languages: "secondary",
  },
  resume_pdf: {
    personal: "primary",
    summary: "primary",
    experience: "primary",
    education: "primary",
    certifications: "secondary",
    skills: "primary",
    languages: "secondary",
    projects: "secondary",
    additionalInfo: "secondary",
  },
};

function buildSections(normalizedResume, sourceType) {
  const personal = pickNonEmptyFields(normalizedResume.personal);
  const priorityMap = sourceSectionPriority[sourceType] ?? {};
  const sections = [];

  if (countObjectValues(personal) > 0 || compactText(normalizedResume.title)) {
    sections.push({
      key: "personal",
      label: "Dados principais",
      count: countObjectValues(personal) + (compactText(normalizedResume.title) ? 1 : 0),
      preview: uniqueList([
        personal.fullName,
        personal.role,
        personal.email,
        personal.phone,
        personal.city,
        personal.objective,
        personal.photo ? "Foto de perfil detectada" : "",
        personal.linkedin,
        personal.github,
        personal.portfolio,
      ]).slice(0, 4),
      priority: priorityMap.personal ?? "secondary",
      confidence: "high",
      recommended: true,
    });
  }

  if (compactText(normalizedResume.summary)) {
    sections.push({
      key: "summary",
      label: "Resumo profissional",
      count: 1,
      preview: [compactText(normalizedResume.summary).slice(0, 180)],
      priority: priorityMap.summary ?? "secondary",
      confidence: "high",
      recommended: true,
    });
  }

  if ((normalizedResume.experience ?? []).length > 0) {
    sections.push({
      key: "experience",
      label: "Experiencia profissional",
      count: normalizedResume.experience.length,
      preview: uniqueList(buildExperiencePreview(normalizedResume.experience)),
      priority: priorityMap.experience ?? "secondary",
      confidence: "high",
      recommended: true,
    });
  }

  if ((normalizedResume.education ?? []).length > 0) {
    sections.push({
      key: "education",
      label: "Formacao",
      count: normalizedResume.education.length,
      preview: uniqueList(buildEducationPreview(normalizedResume.education)),
      priority: priorityMap.education ?? "secondary",
      confidence: "high",
      recommended: true,
    });
  }

  if ((normalizedResume.certifications ?? []).length > 0) {
    sections.push({
      key: "certifications",
      label: "Certificacoes",
      count: normalizedResume.certifications.length,
      preview: uniqueList(buildCertificationPreview(normalizedResume.certifications)),
      priority: priorityMap.certifications ?? "secondary",
      confidence: "high",
      recommended: true,
    });
  }

  if ((normalizedResume.skills ?? []).length > 0) {
    sections.push({
      key: "skills",
      label: "Competencias",
      count: normalizedResume.skills.length,
      preview: uniqueList(normalizedResume.skills).slice(0, 4),
      priority: priorityMap.skills ?? "secondary",
      confidence: "high",
      recommended: true,
    });
  }

  if ((normalizedResume.languages ?? []).length > 0) {
    sections.push({
      key: "languages",
      label: "Idiomas",
      count: normalizedResume.languages.length,
      preview: uniqueList(
        normalizedResume.languages.map((item) => [item.name, item.level].filter(Boolean).join(" • ")),
      ).slice(0, 3),
      priority: priorityMap.languages ?? "secondary",
      confidence: "high",
      recommended: true,
    });
  }

  if ((normalizedResume.projects ?? []).length > 0) {
    sections.push({
      key: "projects",
      label: "Projetos",
      count: normalizedResume.projects.length,
      preview: uniqueList(buildProjectPreview(normalizedResume.projects)),
      priority: priorityMap.projects ?? "secondary",
      confidence: "high",
      recommended: true,
    });
  }

  if (compactText(normalizedResume.additionalInfo)) {
    sections.push({
      key: "additionalInfo",
      label: "Informacoes adicionais",
      count: 1,
      preview: [compactText(normalizedResume.additionalInfo).slice(0, 180)],
      priority: priorityMap.additionalInfo ?? "secondary",
      confidence: "medium",
      recommended: true,
    });
  }

  return sections;
}

export function createImportResult({
  sourceType,
  sourceLabel,
  normalizedResume,
  parser,
  warnings = [],
  notes = [],
  sections: providedSections,
  suspiciousSections = [],
  meta: extraMeta = {},
}) {
  const sections = Array.isArray(providedSections) ? providedSections : buildSections(normalizedResume, sourceType);

  if (sections.length === 0) {
    throw createHttpError("Nao foi possivel detectar dados suficientes para importar. Revise a fonte enviada e tente novamente.", 422);
  }

  return {
    source: {
      type: sourceType,
      label: sourceLabel,
    },
    normalizedResume,
    sections,
    suspiciousSections,
    meta: {
      parser,
      warnings: uniqueList(warnings),
      notes: uniqueList(notes),
      detectedAt: new Date().toISOString(),
      ...extraMeta,
    },
  };
}

export function uniqueKeywords(items = []) {
  return uniqueList(items);
}

export function sanitizePartialResume(source = {}) {
  const personal = pickNonEmptyFields(source.personal ?? {});

  return {
    ...(compactText(source.title) ? { title: compactText(source.title) } : {}),
    ...(Object.keys(personal).length > 0 ? { personal } : {}),
    ...(compactText(source.summary) ? { summary: compactText(source.summary) } : {}),
    ...(Array.isArray(source.experience) && source.experience.length > 0 ? { experience: source.experience } : {}),
    ...(Array.isArray(source.education) && source.education.length > 0 ? { education: source.education } : {}),
    ...(Array.isArray(source.skills) && source.skills.length > 0 ? { skills: uniqueList(source.skills) } : {}),
    ...(Array.isArray(source.languages) && source.languages.length > 0 ? { languages: source.languages } : {}),
    ...(Array.isArray(source.certifications) && source.certifications.length > 0 ? { certifications: source.certifications } : {}),
    ...(Array.isArray(source.projects) && source.projects.length > 0 ? { projects: source.projects } : {}),
    ...(compactText(source.additionalInfo) ? { additionalInfo: compactText(source.additionalInfo) } : {}),
  };
}
