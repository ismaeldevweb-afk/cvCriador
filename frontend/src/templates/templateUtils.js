export const fontStacks = {
  manrope: "'Manrope', 'Helvetica Neue', Arial, sans-serif",
  space: "'Space Grotesk', 'Helvetica Neue', Arial, sans-serif",
  fraunces: "'Fraunces', Georgia, serif",
};

const spacingScale = {
  compact: "1.1rem",
  balanced: "1.6rem",
  airy: "2rem",
};

const titleScale = {
  sm: "2.1rem",
  md: "2.7rem",
  lg: "3.2rem",
};

function trimText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeAssetUrl(value = "") {
  const normalized = trimText(value);

  if (!normalized) {
    return "";
  }

  if (/^data:/i.test(normalized)) {
    return /^data:image\/[a-z0-9.+-]+;base64,/i.test(normalized) ? normalized : "";
  }

  if (/^[a-z][a-z\d+.-]*:/i.test(normalized)) {
    return /^https?:\/\//i.test(normalized) ? normalized : "";
  }

  if (/^\/\//.test(normalized)) {
    return `https:${normalized}`;
  }

  if (/^\//.test(normalized)) {
    return normalized;
  }

  if (/^[\w.-]+\.[a-z]{2,}(?:[/?#:].*)?$/i.test(normalized)) {
    return `https://${normalized}`;
  }

  return normalized;
}

export function buildThemeTokens(customization = {}) {
  const primaryColor = customization.primaryColor ?? "#0f766e";

  return {
    primaryColor,
    fontFamily: fontStacks[customization.fontFamily] ?? fontStacks.manrope,
    sectionGap: spacingScale[customization.spacing] ?? spacingScale.balanced,
    titleSize: titleScale[customization.titleScale] ?? titleScale.md,
    bodyColor: "#0f172a",
    mutedColor: "#475569",
    lineColor: `${primaryColor}22`,
    softTint: `${primaryColor}10`,
  };
}

export function getResumeSnapshot(resume) {
  const personal = {
    ...(resume.personal ?? {}),
    photo: normalizeAssetUrl(resume.personal?.photo),
  };

  return {
    title: trimText(resume.title),
    personal,
    summary: trimText(resume.summary),
    objective: trimText(personal.objective),
    additionalInfo: trimText(resume.additionalInfo),
    experience: (resume.experience ?? []).filter((item) =>
      [item.company, item.role, item.period, item.description].some((value) => trimText(value)),
    ),
    education: (resume.education ?? []).filter((item) =>
      [item.institution, item.course, item.period].some((value) => trimText(value)),
    ),
    skills: (resume.skills ?? []).map(trimText).filter(Boolean),
    languages: (resume.languages ?? []).filter((item) =>
      [item.name, item.level].some((value) => trimText(value)),
    ),
    certifications: (resume.certifications ?? []).filter((item) =>
      [item.name, item.issuer, item.year].some((value) => trimText(value)),
    ),
    projects: (resume.projects ?? []).filter((item) =>
      [item.name, item.description, item.technologies, item.link].some((value) => trimText(value)),
    ),
    contactLines: [
      trimText(personal.email),
      trimText(personal.phone),
      trimText(personal.city),
      trimText(personal.linkedin),
      trimText(personal.github),
      trimText(personal.portfolio),
    ].filter(Boolean),
  };
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function withLineBreaks(value = "") {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

export function wrapDocument(markup, theme, pageBackground = "#f8fafc") {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Criador de Curriculo Online</title>
  </head>
  <body style="margin:0;background:${pageBackground};font-family:${theme.fontFamily};color:${theme.bodyColor};">
    <div style="padding:24px;">
      <div style="max-width:794px;margin:0 auto;">
        ${markup}
      </div>
    </div>
  </body>
</html>`;
}
