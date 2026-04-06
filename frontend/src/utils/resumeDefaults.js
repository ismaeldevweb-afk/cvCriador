const createId = () => Math.random().toString(36).slice(2, 10);

export const editorSteps = [
  "Dados principais",
  "Historico profissional",
  "Competencias",
  "Projetos e detalhes",
];

export const templateOptions = [
  {
    id: "modern",
    name: "Moderno",
    description: "Estrutura viva para tecnologia, produto e carreira em crescimento.",
  },
  {
    id: "classic",
    name: "Classico",
    description: "Leitura direta, elegante e segura para processos tradicionais.",
  },
  {
    id: "executive",
    name: "Executivo",
    description: "Composicao corporativa com leitura premium para lideranca e perfis seniores.",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Narrativa visual com hierarquia forte para portfolios e perfis criativos.",
  },
  {
    id: "minimal",
    name: "Minimalista",
    description: "Visual limpo com foco em clareza, espaco e sofisticacao.",
  },
  {
    id: "compact",
    name: "Compacto",
    description: "Estrutura enxuta, densa e eficiente para vagas com triagem rapida.",
  },
  {
    id: "spotlight",
    name: "Destaque",
    description: "Hero visual com foto, resumo forte e leitura premium para perfis estrategicos.",
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Linha do tempo clara com foto e narrativa cronologica para trajetorias consistentes.",
  },
  {
    id: "atelier",
    name: "Atelier",
    description: "Composicao autoral com foto, serifas fortes e narrativa premium para perfis criativos.",
  },
  {
    id: "horizon",
    name: "Horizonte",
    description: "Layout amplo e corporativo com hero horizontal e leitura limpa para produto e lideranca.",
  },
  {
    id: "noir",
    name: "Noir",
    description: "Estetica escura e sofisticada com contraste alto para perfis de impacto e posicionamento forte.",
  },
  {
    id: "mosaic",
    name: "Mosaico",
    description: "Grade modular em blocos para destacar projetos, repertorio e competencias com dinamismo.",
  },
  {
    id: "ledger",
    name: "Ledger",
    description: "Estrutura refinada e precisa para curriculos densos com leitura organizada e acabamento elegante.",
  },
];

export const fontOptions = [
  { id: "manrope", name: "Manrope" },
  { id: "space", name: "Space Grotesk" },
  { id: "fraunces", name: "Fraunces" },
];

export const colorOptions = [
  "#0f766e",
  "#0f172a",
  "#2563eb",
  "#be185d",
  "#7c3aed",
  "#ea580c",
];

export const spacingOptions = [
  { id: "compact", name: "Compacto" },
  { id: "balanced", name: "Equilibrado" },
  { id: "airy", name: "Amplo" },
];

export const titleScaleOptions = [
  { id: "sm", name: "Contido" },
  { id: "md", name: "Padrao" },
  { id: "lg", name: "Impactante" },
];

export function createExperience() {
  return {
    id: createId(),
    company: "",
    role: "",
    period: "",
    description: "",
  };
}

export function createEducation() {
  return {
    id: createId(),
    institution: "",
    course: "",
    period: "",
  };
}

export function createLanguage() {
  return {
    id: createId(),
    name: "",
    level: "",
  };
}

export function createCertification() {
  return {
    id: createId(),
    name: "",
    issuer: "",
    year: "",
  };
}

export function createProject() {
  return {
    id: createId(),
    name: "",
    description: "",
    technologies: "",
    link: "",
  };
}

export function createEmptyResume() {
  return {
    title: "Meu curriculo",
    personal: {
      fullName: "",
      role: "",
      objective: "",
      photo: "",
      email: "",
      phone: "",
      city: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    summary: "",
    experience: [createExperience()],
    education: [createEducation()],
    skills: [""],
    languages: [createLanguage()],
    certifications: [createCertification()],
    projects: [createProject()],
    additionalInfo: "",
    template: "modern",
    customization: {
      primaryColor: "#0f766e",
      fontFamily: "manrope",
      spacing: "balanced",
      titleScale: "md",
    },
  };
}

function normalizeList(items, factory) {
  if (!Array.isArray(items) || items.length === 0) {
    return [factory()];
  }

  return items.map((item) => ({
    ...factory(),
    ...item,
    id: item.id ?? createId(),
  }));
}

export function normalizeResume(source) {
  const base = createEmptyResume();
  const resume = source ?? {};

  return {
    title: resume.title ?? base.title,
    personal: {
      ...base.personal,
      ...(resume.personal ?? {}),
    },
    summary: resume.summary ?? base.summary,
    experience: normalizeList(resume.experience, createExperience),
    education: normalizeList(resume.education, createEducation),
    skills:
      Array.isArray(resume.skills) && resume.skills.length > 0 ? resume.skills : base.skills,
    languages: normalizeList(resume.languages, createLanguage),
    certifications: normalizeList(resume.certifications, createCertification),
    projects: normalizeList(resume.projects, createProject),
    additionalInfo: resume.additionalInfo ?? base.additionalInfo,
    template: resume.template ?? base.template,
    customization: {
      ...base.customization,
      ...(resume.customization ?? {}),
    },
  };
}

export function hasMeaningfulResumeContent(source) {
  const base = createEmptyResume();
  const resume = normalizeResume(source);

  const hasText = (value) => String(value ?? "").trim().length > 0;
  const hasListContent = (items, fields) => items.some((item) => fields.some((field) => hasText(item?.[field])));

  return (
    resume.title !== base.title ||
    Object.values(resume.personal).some(hasText) ||
    hasText(resume.summary) ||
    hasText(resume.additionalInfo) ||
    resume.template !== base.template ||
    resume.customization.primaryColor !== base.customization.primaryColor ||
    resume.customization.fontFamily !== base.customization.fontFamily ||
    resume.customization.spacing !== base.customization.spacing ||
    resume.customization.titleScale !== base.customization.titleScale ||
    resume.skills.some(hasText) ||
    hasListContent(resume.experience, ["company", "role", "period", "description"]) ||
    hasListContent(resume.education, ["institution", "course", "period"]) ||
    hasListContent(resume.languages, ["name", "level"]) ||
    hasListContent(resume.certifications, ["name", "issuer", "year"]) ||
    hasListContent(resume.projects, ["name", "description", "technologies", "link"])
  );
}
