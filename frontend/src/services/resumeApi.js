import { ApiError } from "./apiClient";
import { normalizeResume } from "../utils/resumeDefaults";

export const LOCAL_RESUME_LIMIT = 5;
export const LOCAL_ACTIVE_DRAFT_LIMIT = 1;

const STORAGE_KEY = "curriculo-online.resumes";
const DRAFT_STORAGE_KEY = "curriculo-online.editor-draft";
const UNSUPPORTED_DATA_URI_PATTERN = /^data:(?:image\/[a-z0-9.+-]+|application\/pdf);base64,/i;

function hasStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function createResumeId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `resume-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeText(value) {
  const nextValue = typeof value === "string" ? value : "";

  if (UNSUPPORTED_DATA_URI_PATTERN.test(nextValue.trimStart())) {
    return "";
  }

  return nextValue;
}

function sanitizeId(value) {
  return typeof value === "string" && value ? value : createResumeId();
}

function sanitizeListItem(item = {}, fields = []) {
  return fields.reduce((accumulator, field) => {
    accumulator[field] = field === "id" ? sanitizeId(item[field]) : sanitizeText(item[field]);
    return accumulator;
  }, {});
}

function sanitizeResumeForStorage(source = {}) {
  const resume = normalizeResume(source);

  return {
    title: sanitizeText(resume.title),
    personal: {
      fullName: sanitizeText(resume.personal.fullName),
      role: sanitizeText(resume.personal.role),
      objective: sanitizeText(resume.personal.objective),
      photo: sanitizeText(resume.personal.photo),
      email: sanitizeText(resume.personal.email),
      phone: sanitizeText(resume.personal.phone),
      city: sanitizeText(resume.personal.city),
      linkedin: sanitizeText(resume.personal.linkedin),
      github: sanitizeText(resume.personal.github),
      portfolio: sanitizeText(resume.personal.portfolio),
    },
    summary: sanitizeText(resume.summary),
    experience: resume.experience.map((item) => sanitizeListItem(item, ["id", "company", "role", "period", "description"])),
    education: resume.education.map((item) => sanitizeListItem(item, ["id", "institution", "course", "period"])),
    skills: (resume.skills ?? []).map((item) => sanitizeText(item)),
    languages: resume.languages.map((item) => sanitizeListItem(item, ["id", "name", "level"])),
    certifications: resume.certifications.map((item) => sanitizeListItem(item, ["id", "name", "issuer", "year"])),
    projects: resume.projects.map((item) => sanitizeListItem(item, ["id", "name", "description", "technologies", "link"])),
    additionalInfo: sanitizeText(resume.additionalInfo),
    template: sanitizeText(resume.template),
    customization: {
      primaryColor: sanitizeText(resume.customization.primaryColor),
      fontFamily: sanitizeText(resume.customization.fontFamily),
      spacing: sanitizeText(resume.customization.spacing),
      titleScale: sanitizeText(resume.customization.titleScale),
    },
  };
}

export function buildResumeStorageMeta(items = []) {
  const total = Array.isArray(items) ? items.length : 0;

  return {
    total,
    limit: LOCAL_RESUME_LIMIT,
    remaining: Math.max(LOCAL_RESUME_LIMIT - total, 0),
    limitReached: total >= LOCAL_RESUME_LIMIT,
  };
}

function sortByUpdatedAt(items) {
  return [...items].sort((left, right) => {
    const leftTime = Date.parse(left.updatedAt ?? left.createdAt ?? 0);
    const rightTime = Date.parse(right.updatedAt ?? right.createdAt ?? 0);
    return rightTime - leftTime;
  });
}

function readStoredRecords() {
  if (!hasStorage()) {
    return [];
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
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

function writeStoredRecords(records) {
  if (!hasStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function readStoredDraft() {
  if (!hasStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : null;
  } catch {
    return null;
  }
}

function writeStoredDraft(draft) {
  if (!hasStorage()) {
    return;
  }

  if (!draft) {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

function createNotFoundError(id) {
  return new ApiError("Curriculo nao encontrado.", {
    status: 404,
    path: `/resumes/${id}`,
  });
}

function createResumeLimitError() {
  return new ApiError("Voce atingiu o limite de curriculos salvos neste modo local. Exclua versoes antigas para abrir espaco para novas versoes.", {
    status: 409,
    path: "/resumes",
    data: {
      code: "LOCAL_RESUME_LIMIT_REACHED",
      limit: LOCAL_RESUME_LIMIT,
    },
  });
}

function ensureResumeCapacity(items) {
  if (buildResumeStorageMeta(items).limitReached) {
    throw createResumeLimitError();
  }
}

function validateResumePayload(payload = {}) {
  const title = sanitizeText(payload.title?.trim() || payload.name?.trim());
  const template = sanitizeText(payload.template?.trim());
  const data = payload.data;

  if (!title) {
    throw new ApiError("Informe um titulo para o curriculo.", { status: 400, path: "/resumes" });
  }

  if (!template) {
    throw new ApiError("Escolha um template.", { status: 400, path: "/resumes" });
  }

  if (!data || typeof data !== "object") {
    throw new ApiError("Os dados do curriculo sao obrigatorios.", { status: 400, path: "/resumes" });
  }

  return {
    title,
    template,
    data: sanitizeResumeForStorage(data),
  };
}

function normalizeRecord(record = {}) {
  const now = new Date().toISOString();
  const data = sanitizeResumeForStorage(record.data);

  return {
    id: String(record.id ?? createResumeId()),
    title: sanitizeText(record.title?.trim()) || data.title,
    template: sanitizeText(record.template?.trim()) || data.template,
    data,
    createdAt: record.createdAt ?? now,
    updatedAt: record.updatedAt ?? record.createdAt ?? now,
  };
}

function readResumes() {
  return sortByUpdatedAt(readStoredRecords().map(normalizeRecord));
}

function writeResumes(resumes) {
  writeStoredRecords(sortByUpdatedAt(resumes).map(normalizeRecord));
}

export function hasSavedResumes() {
  return readResumes().length > 0;
}

function getResumeOrThrow(id) {
  const resume = readResumes().find((item) => item.id === String(id));

  if (!resume) {
    throw createNotFoundError(id);
  }

  return resume;
}

export const resumeApi = {
  async list() {
    const resumes = readResumes();

    return {
      resumes,
      storage: buildResumeStorageMeta(resumes),
    };
  },

  async getById(id) {
    return {
      resume: getResumeOrThrow(id),
    };
  },

  async create(payload) {
    const { title, template, data } = validateResumePayload(payload);
    const resumes = readResumes();

    ensureResumeCapacity(resumes);

    const now = new Date().toISOString();
    const resume = normalizeRecord({
      id: createResumeId(),
      title,
      template,
      data,
      createdAt: now,
      updatedAt: now,
    });

    writeResumes([resume, ...resumes]);

    return {
      resume,
    };
  },

  async update(id, payload) {
    const { title, template, data } = validateResumePayload(payload);
    const existingResume = getResumeOrThrow(id);
    const nextResume = normalizeRecord({
      ...existingResume,
      title,
      template,
      data,
      updatedAt: new Date().toISOString(),
    });
    const resumes = readResumes().map((item) => (item.id === existingResume.id ? nextResume : item));

    writeResumes(resumes);

    return {
      resume: nextResume,
    };
  },

  async remove(id) {
    const resumes = readResumes();
    const nextResumes = resumes.filter((item) => item.id !== String(id));

    if (nextResumes.length === resumes.length) {
      throw createNotFoundError(id);
    }

    writeResumes(nextResumes);

    return {
      success: true,
    };
  },

  async duplicate(id) {
    const resumes = readResumes();
    const existingResume = resumes.find((item) => item.id === String(id));

    if (!existingResume) {
      throw createNotFoundError(id);
    }

    ensureResumeCapacity(resumes);

    const now = new Date().toISOString();
    const duplicatedResume = normalizeRecord({
      ...existingResume,
      id: createResumeId(),
      title: `Copia de ${existingResume.title}`,
      createdAt: now,
      updatedAt: now,
    });

    writeResumes([duplicatedResume, ...resumes]);

    return {
      resume: duplicatedResume,
    };
  },

  getStorageMeta() {
    return buildResumeStorageMeta(readResumes());
  },
};

export const resumeDraftApi = {
  get() {
    const draft = readStoredDraft();

    if (!draft?.data) {
      return null;
    }

    return {
      data: sanitizeResumeForStorage(draft.data),
      updatedAt: draft.updatedAt ?? null,
    };
  },

  save(data) {
    const draft = {
      data: sanitizeResumeForStorage(data),
      updatedAt: new Date().toISOString(),
    };

    writeStoredDraft(draft);

    return draft;
  },

  clear() {
    writeStoredDraft(null);
  },
};
