const PDF_EXPORTS_STORAGE_KEY = "curriculo-online.pdf-exports";
export const LOCAL_PDF_EXPORTS_LIMIT = 15;

function hasStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function createEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `activity-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function readStoredExports() {
  if (!hasStorage()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(PDF_EXPORTS_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function writeStoredExports(items) {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(PDF_EXPORTS_STORAGE_KEY, JSON.stringify(items));
}

function normalizeExportRecord(record = {}) {
  return {
    id: String(record.id ?? createEventId()),
    fileName: record.fileName?.trim() || "curriculo-online.pdf",
    exportedAt: record.exportedAt ?? new Date().toISOString(),
  };
}

function sortByExportedAt(items) {
  return [...items].sort((left, right) => {
    const leftTime = Date.parse(left.exportedAt ?? 0);
    const rightTime = Date.parse(right.exportedAt ?? 0);
    return rightTime - leftTime;
  });
}

function readPdfExports() {
  return sortByExportedAt(readStoredExports().map(normalizeExportRecord));
}

export const activityInsights = {
  trackPdfExport({ fileName } = {}) {
    const nextEvent = normalizeExportRecord({
      fileName,
      exportedAt: new Date().toISOString(),
    });

    writeStoredExports([nextEvent, ...readPdfExports()].slice(0, LOCAL_PDF_EXPORTS_LIMIT));

    return nextEvent;
  },

  getPdfExportSummary(limit = 3) {
    const items = readPdfExports();

    return {
      totalExports: items.length,
      lastExportAt: items[0]?.exportedAt ?? null,
      recentExports: items.slice(0, limit),
    };
  },
};
