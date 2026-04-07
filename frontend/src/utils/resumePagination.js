export const MM_TO_PX = 96 / 25.4;
export const A4_PAGE_WIDTH_MM = 210;
export const A4_PAGE_HEIGHT_MM = 297;
export const RESUME_PAGE_PADDING_MM = 12;
export const A4_PAGE_WIDTH_PX = A4_PAGE_WIDTH_MM * MM_TO_PX;
export const A4_PAGE_HEIGHT_PX = A4_PAGE_HEIGHT_MM * MM_TO_PX;
export const RESUME_PAGE_PADDING_PX = RESUME_PAGE_PADDING_MM * MM_TO_PX;
export const RESUME_CONTENT_HEIGHT_PX = A4_PAGE_HEIGHT_PX - RESUME_PAGE_PADDING_PX * 2;

const BEGINNER_KEYWORDS = [
  "junior",
  "iniciante",
  "trainee",
  "estagi",
  "primeiro emprego",
  "entry level",
  "aprendiz",
];

function compactText(value = "") {
  return String(value ?? "").trim().toLowerCase();
}

function hasMeaningfulText(value = "") {
  return compactText(value).length > 0;
}

function countMeaningfulItems(items = [], fields = []) {
  return Array.isArray(items)
    ? items.filter((item) => fields.some((field) => hasMeaningfulText(item?.[field]))).length
    : 0;
}

function buildCandidateMetrics(element, rootTop) {
  const rect = element.getBoundingClientRect();
  const top = rect.top - rootTop;
  const bottom = rect.bottom - rootTop;

  return {
    element,
    top,
    bottom,
    height: rect.height,
  };
}

export function sanitizePageStarts(values = []) {
  const normalized = Array.isArray(values)
    ? values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value >= 0)
        .map((value) => Math.round(value))
    : [];

  const withFirstPage = normalized.length > 0 ? normalized : [0];
  const unique = Array.from(new Set(withFirstPage));
  const sorted = unique.sort((left, right) => left - right);

  if (sorted[0] !== 0) {
    sorted.unshift(0);
  }

  return sorted;
}

export function isBeginnerResume(resume = {}) {
  const profileText = [
    resume.personal?.role,
    resume.personal?.objective,
    resume.summary,
  ]
    .map(compactText)
    .filter(Boolean)
    .join(" ");

  if (BEGINNER_KEYWORDS.some((keyword) => profileText.includes(keyword))) {
    return true;
  }

  const experienceCount = countMeaningfulItems(resume.experience, ["company", "role", "description"]);
  const projectCount = countMeaningfulItems(resume.projects, ["name", "description"]);
  const educationCount = countMeaningfulItems(resume.education, ["institution", "course"]);

  if (experienceCount === 0) {
    return educationCount > 0 || projectCount > 0;
  }

  return experienceCount <= 1 && projectCount <= 2;
}

export function calculatePageStarts({
  root,
  pageHeight = RESUME_CONTENT_HEIGHT_PX,
  maxPages = 8,
} = {}) {
  if (!root) {
    return [0];
  }

  const totalHeight = Math.max(root.scrollHeight, root.getBoundingClientRect().height);

  if (totalHeight <= pageHeight + 1) {
    return [0];
  }

  const rootRect = root.getBoundingClientRect();
  const candidates = Array.from(
    root.querySelectorAll(
      [
        "[data-resume-block]",
        "section",
        "section > div > div",
        "section > div > article",
        "section > div > section",
        "aside > div > div",
      ].join(","),
    ),
  )
    .map((element) => buildCandidateMetrics(element, rootRect.top))
    .filter((candidate) => candidate.height > 24)
    .sort((left, right) => {
      if (left.top === right.top) {
        return left.bottom - right.bottom;
      }

      return left.top - right.top;
    });

  if (!candidates.length) {
    const fallbackStarts = [0];

    while (totalHeight - fallbackStarts[fallbackStarts.length - 1] > pageHeight + 1 && fallbackStarts.length < maxPages) {
      fallbackStarts.push(Math.round(fallbackStarts[fallbackStarts.length - 1] + pageHeight));
    }

    return sanitizePageStarts(fallbackStarts);
  }

  const pageStarts = [0];
  let currentPageTop = 0;
  let safetyCounter = 0;

  while (safetyCounter < maxPages - 1) {
    const currentPageBottom = currentPageTop + pageHeight;
    const overflowingCandidate = candidates.find(
      (candidate) => candidate.top >= currentPageTop + 2 && candidate.bottom > currentPageBottom + 1,
    );

    if (!overflowingCandidate) {
      break;
    }

    let nextPageStart = Math.round(overflowingCandidate.top);

    if (nextPageStart <= currentPageTop + 2) {
      nextPageStart = Math.round(currentPageBottom);
    }

    if (nextPageStart <= pageStarts[pageStarts.length - 1]) {
      nextPageStart = Math.round(pageStarts[pageStarts.length - 1] + pageHeight);
    }

    if (nextPageStart >= totalHeight - 1) {
      break;
    }

    pageStarts.push(nextPageStart);
    currentPageTop = nextPageStart;
    safetyCounter += 1;

    if (totalHeight - currentPageTop <= pageHeight + 1) {
      break;
    }
  }

  while (totalHeight - pageStarts[pageStarts.length - 1] > pageHeight + 1 && pageStarts.length < maxPages) {
    pageStarts.push(Math.round(pageStarts[pageStarts.length - 1] + pageHeight));
  }

  return sanitizePageStarts(pageStarts);
}
