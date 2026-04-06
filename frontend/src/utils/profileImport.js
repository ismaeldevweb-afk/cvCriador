import { normalizeResume } from "./resumeDefaults";

function hasText(value = "") {
  return String(value ?? "").trim().length > 0;
}

function hasArrayContent(items = []) {
  return Array.isArray(items) && items.length > 0;
}

function mergePersonal(currentPersonal = {}, importedPersonal = {}) {
  const nextPersonal = { ...currentPersonal };

  for (const [field, value] of Object.entries(importedPersonal ?? {})) {
    if (hasText(value)) {
      nextPersonal[field] = String(value).trim();
    }
  }

  return nextPersonal;
}

function mergeSkills(currentSkills = [], importedSkills = []) {
  const current = currentSkills.map((item) => String(item ?? "").trim()).filter(Boolean);
  const imported = importedSkills.map((item) => String(item ?? "").trim()).filter(Boolean);

  if (imported.length === 0) {
    return currentSkills;
  }

  return Array.from(new Set([...current, ...imported]));
}

export function buildImportSelection(importPreview) {
  return Object.fromEntries(
    (importPreview?.sections ?? []).map((section) => [section.key, section.recommended !== false]),
  );
}

export function applyImportPreviewToResume(currentResume, importPreview, selectedSections = {}) {
  const current = normalizeResume(currentResume);
  const imported = importPreview?.normalizedResume ?? {};
  const nextResume = {
    ...current,
  };

  if (selectedSections.personal) {
    nextResume.personal = mergePersonal(current.personal, imported.personal);

    if (hasText(imported.title) && (!hasText(current.title) || current.title === "Meu curriculo")) {
      nextResume.title = String(imported.title).trim();
    } else if (
      hasText(imported.personal?.fullName) &&
      (!hasText(current.title) || current.title === "Meu curriculo")
    ) {
      nextResume.title = `Curriculo ${String(imported.personal.fullName).trim()}`;
    }
  }

  if (selectedSections.summary && hasText(imported.summary)) {
    nextResume.summary = String(imported.summary).trim();
  }

  if (selectedSections.experience && hasArrayContent(imported.experience)) {
    nextResume.experience = imported.experience;
  }

  if (selectedSections.education && hasArrayContent(imported.education)) {
    nextResume.education = imported.education;
  }

  if (selectedSections.certifications && hasArrayContent(imported.certifications)) {
    nextResume.certifications = imported.certifications;
  }

  if (selectedSections.skills && hasArrayContent(imported.skills)) {
    nextResume.skills = mergeSkills(current.skills, imported.skills);
  }

  if (selectedSections.languages && hasArrayContent(imported.languages)) {
    nextResume.languages = imported.languages;
  }

  if (selectedSections.projects && hasArrayContent(imported.projects)) {
    nextResume.projects = imported.projects;
  }

  if (selectedSections.additionalInfo && hasText(imported.additionalInfo)) {
    nextResume.additionalInfo = String(imported.additionalInfo).trim();
  }

  return normalizeResume(nextResume);
}
