import {
  A4_PAGE_HEIGHT_MM,
  RESUME_PAGE_PADDING_MM,
  sanitizePageStarts,
} from "../utils/resumePagination";

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

export function wrapDocument(markup, theme, pageBackground = "#f8fafc", options = {}) {
  const pageStarts = sanitizePageStarts(options.pagination?.pageStarts ?? [0]);
  const pageHeight = `${A4_PAGE_HEIGHT_MM}mm`;
  const pagePadding = `${RESUME_PAGE_PADDING_MM}mm`;
  const viewportHeight = `${A4_PAGE_HEIGHT_MM - RESUME_PAGE_PADDING_MM * 2}mm`;
  const pagesMarkup = pageStarts
    .map(
      (pageStart, index) => `
        <section class="resume-print-page" style="${index < pageStarts.length - 1 ? "" : "break-after:auto;page-break-after:auto;"}">
          <div class="resume-print-body">
            <div class="resume-print-viewport">
              <div class="resume-page-content" style="${pageStart > 0 ? `transform:translateY(-${pageStart}px);` : ""}">
                ${markup}
              </div>
            </div>
          </div>
        </section>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Criador de Curriculo Online</title>
    <style>
      * {
        box-sizing: border-box;
      }

      @page {
        margin: 0;
        size: A4;
      }

      html,
      body {
        margin: 0;
        padding: 0;
      }

      body {
        background: ${pageBackground};
        color: ${theme.bodyColor};
        font-family: ${theme.fontFamily};
      }

      .resume-document-stack {
        display: flex;
        flex-direction: column;
        gap: 0;
      }

      .resume-print-page {
        background: #ffffff;
        break-after: page;
        height: ${pageHeight};
        overflow: hidden;
        page-break-after: always;
        width: 210mm;
      }

      .resume-print-body {
        background: #ffffff;
        height: 100%;
        padding: ${pagePadding};
        width: 100%;
      }

      .resume-print-viewport {
        height: ${viewportHeight};
        overflow: hidden;
        position: relative;
        width: 100%;
      }

      .resume-page-content {
        width: 100%;
      }

      .resume-page-content > article {
        border-radius: 0 !important;
        box-shadow: none !important;
        min-height: 100%;
      }
    </style>
  </head>
  <body>
    <main class="resume-document-stack">${pagesMarkup}</main>
  </body>
</html>`;
}
