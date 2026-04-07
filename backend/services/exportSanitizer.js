import {
  colorOptions,
  fontOptions,
  normalizeResume,
  spacingOptions,
  templateOptions,
  titleScaleOptions,
} from "../../frontend/src/utils/resumeDefaults.js";

const DEFAULT_TEMPLATE = "modern";
const DEFAULT_CUSTOMIZATION = {
  primaryColor: "#0f766e",
  fontFamily: "manrope",
  spacing: "balanced",
  titleScale: "md",
};

const ALLOWED_TEMPLATES = new Set(templateOptions.map((item) => item.id));
const ALLOWED_COLORS = new Set(colorOptions);
const ALLOWED_FONTS = new Set(fontOptions.map((item) => item.id));
const ALLOWED_SPACING = new Set(spacingOptions.map((item) => item.id));
const ALLOWED_TITLE_SCALES = new Set(titleScaleOptions.map((item) => item.id));

function sanitizeText(value, maxLength = 4000) {
  return typeof value === "string" ? value.replace(/\u0000/g, "").trim().slice(0, maxLength) : "";
}

function sanitizeList(items, maxItems, mapper) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.slice(0, maxItems).map(mapper);
}

function sanitizePageStarts(values = []) {
  const normalized = Array.isArray(values)
    ? values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value >= 0)
        .map((value) => Math.round(value))
    : [];

  const withDefault = normalized.length > 0 ? normalized : [0];
  const unique = Array.from(new Set(withDefault)).sort((left, right) => left - right);

  if (unique[0] !== 0) {
    unique.unshift(0);
  }

  return unique.slice(0, 8);
}

export function sanitizeResumeForExport(source = {}) {
  const resume = normalizeResume(source);

  return {
    title: sanitizeText(resume.title, 120),
    personal: {
      fullName: sanitizeText(resume.personal.fullName, 120),
      role: sanitizeText(resume.personal.role, 160),
      objective: sanitizeText(resume.personal.objective, 2000),
      photo: sanitizeText(resume.personal.photo, 2048),
      email: sanitizeText(resume.personal.email, 160),
      phone: sanitizeText(resume.personal.phone, 80),
      city: sanitizeText(resume.personal.city, 120),
      linkedin: sanitizeText(resume.personal.linkedin, 240),
      github: sanitizeText(resume.personal.github, 240),
      portfolio: sanitizeText(resume.personal.portfolio, 240),
    },
    summary: sanitizeText(resume.summary, 2500),
    experience: sanitizeList(resume.experience, 20, (item = {}) => ({
      id: sanitizeText(item.id, 64),
      company: sanitizeText(item.company, 140),
      role: sanitizeText(item.role, 140),
      period: sanitizeText(item.period, 80),
      description: sanitizeText(item.description, 2200),
    })),
    education: sanitizeList(resume.education, 12, (item = {}) => ({
      id: sanitizeText(item.id, 64),
      institution: sanitizeText(item.institution, 160),
      course: sanitizeText(item.course, 160),
      period: sanitizeText(item.period, 80),
    })),
    skills: sanitizeList(resume.skills, 40, (item = "") => sanitizeText(item, 80)).filter(Boolean),
    languages: sanitizeList(resume.languages, 12, (item = {}) => ({
      id: sanitizeText(item.id, 64),
      name: sanitizeText(item.name, 80),
      level: sanitizeText(item.level, 80),
    })),
    certifications: sanitizeList(resume.certifications, 20, (item = {}) => ({
      id: sanitizeText(item.id, 64),
      name: sanitizeText(item.name, 160),
      issuer: sanitizeText(item.issuer, 160),
      year: sanitizeText(item.year, 40),
    })),
    projects: sanitizeList(resume.projects, 20, (item = {}) => ({
      id: sanitizeText(item.id, 64),
      name: sanitizeText(item.name, 160),
      description: sanitizeText(item.description, 2200),
      technologies: sanitizeText(item.technologies, 300),
      link: sanitizeText(item.link, 300),
    })),
    additionalInfo: sanitizeText(resume.additionalInfo, 2000),
    template: ALLOWED_TEMPLATES.has(resume.template) ? resume.template : DEFAULT_TEMPLATE,
    customization: {
      primaryColor: ALLOWED_COLORS.has(resume.customization.primaryColor)
        ? resume.customization.primaryColor
        : DEFAULT_CUSTOMIZATION.primaryColor,
      fontFamily: ALLOWED_FONTS.has(resume.customization.fontFamily)
        ? resume.customization.fontFamily
        : DEFAULT_CUSTOMIZATION.fontFamily,
      spacing: ALLOWED_SPACING.has(resume.customization.spacing)
        ? resume.customization.spacing
        : DEFAULT_CUSTOMIZATION.spacing,
      titleScale: ALLOWED_TITLE_SCALES.has(resume.customization.titleScale)
        ? resume.customization.titleScale
        : DEFAULT_CUSTOMIZATION.titleScale,
    },
  };
}

export function sanitizePaginationForExport(source = {}) {
  return {
    pageStarts: sanitizePageStarts(source?.pageStarts),
  };
}
