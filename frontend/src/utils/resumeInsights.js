function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function countMeaningfulItems(items = [], fields = []) {
  return (items ?? []).filter((item) => fields.some((field) => hasText(item?.[field]))).length;
}

function getStageMeta(score) {
  if (score >= 85) {
    return {
      label: "Pronto para enviar",
      tone: "emerald",
    };
  }

  if (score >= 60) {
    return {
      label: "Quase pronto",
      tone: "teal",
    };
  }

  if (score >= 35) {
    return {
      label: "Em construcao",
      tone: "amber",
    };
  }

  return {
    label: "Rascunho inicial",
    tone: "slate",
  };
}

function getCheckpointSuggestion(checkpointId) {
  const suggestions = {
    heading: "Defina nome e cargo para posicionar o curriculo logo no primeiro bloco.",
    contact: "Adicione email, telefone ou link profissional para facilitar o retorno do recrutador.",
    summary: "Escreva um resumo curto orientado para a vaga antes de exportar.",
    experience: "Inclua ao menos uma experiencia com papel, empresa e impacto principal.",
    education: "Registre sua formacao para fechar a base do perfil.",
    skills: "Liste pelo menos 3 skills relevantes para a vaga alvo.",
    proof: "Adicione projeto ou certificacao para provar execucao.",
    reach: "Inclua idioma, portfolio, GitHub ou LinkedIn para ampliar contexto profissional.",
  };

  return suggestions[checkpointId] ?? "Refine os detalhes finais e revise o preview antes de exportar.";
}

function getPrimaryStrength({ experienceCount, projectCount, skillCount, summaryReady, contactCount }) {
  if (experienceCount >= 3) {
    return "Historico profissional consistente";
  }

  if (projectCount >= 2) {
    return "Projetos reforcam repertorio";
  }

  if (skillCount >= 6) {
    return "Stack bem distribuida";
  }

  if (summaryReady) {
    return "Narrativa inicial montada";
  }

  if (contactCount >= 2) {
    return "Contato profissional bem coberto";
  }

  return "Base pronta para evoluir";
}

export function buildResumeInsight(source = {}) {
  const data = source.data ?? source;
  const personal = data.personal ?? {};
  const summaryReady = hasText(data.summary) || hasText(personal.objective);
  const experienceCount = countMeaningfulItems(data.experience, ["company", "role", "period", "description"]);
  const educationCount = countMeaningfulItems(data.education, ["institution", "course", "period"]);
  const skillCount = (data.skills ?? []).filter((item) => hasText(item)).length;
  const languageCount = countMeaningfulItems(data.languages, ["name", "level"]);
  const certificationCount = countMeaningfulItems(data.certifications, ["name", "issuer", "year"]);
  const projectCount = countMeaningfulItems(data.projects, ["name", "description", "technologies", "link"]);
  const contactCount = [
    personal.email,
    personal.phone,
    personal.linkedin,
    personal.github,
    personal.portfolio,
    personal.city,
  ].filter((value) => hasText(value)).length;

  const checkpoints = [
    {
      id: "heading",
      label: "Nome e cargo",
      done: hasText(personal.fullName) && hasText(personal.role),
      weight: 2,
    },
    {
      id: "contact",
      label: "Contato principal",
      done: contactCount >= 2,
      weight: 1,
    },
    {
      id: "summary",
      label: "Resumo estrategico",
      done: summaryReady,
      weight: 1,
    },
    {
      id: "experience",
      label: "Experiencia principal",
      done: experienceCount > 0,
      weight: 2,
    },
    {
      id: "education",
      label: "Formacao",
      done: educationCount > 0,
      weight: 1,
    },
    {
      id: "skills",
      label: "Skills relevantes",
      done: skillCount >= 3,
      weight: 1,
    },
    {
      id: "proof",
      label: "Projetos ou certificacoes",
      done: projectCount > 0 || certificationCount > 0,
      weight: 1,
    },
    {
      id: "reach",
      label: "Idiomas ou links",
      done: languageCount > 0 || hasText(personal.linkedin) || hasText(personal.github) || hasText(personal.portfolio),
      weight: 1,
    },
  ];

  const totalWeight = checkpoints.reduce((sum, item) => sum + item.weight, 0);
  const completedWeight = checkpoints.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
  const completionScore = Math.round((completedWeight / totalWeight) * 100);
  const completedCheckpointCount = checkpoints.filter((item) => item.done).length;
  const nextCheckpoint = checkpoints.find((item) => !item.done) ?? null;
  const stage = getStageMeta(completionScore);
  const filledSectionCount = [
    summaryReady,
    experienceCount > 0,
    educationCount > 0,
    skillCount > 0,
    projectCount > 0,
    certificationCount > 0,
    languageCount > 0,
    hasText(data.additionalInfo),
  ].filter(Boolean).length;

  return {
    completionScore,
    completedCheckpointCount,
    totalCheckpointCount: checkpoints.length,
    stage: stage.label,
    stageTone: stage.tone,
    focusLabel: nextCheckpoint?.label ?? "Revisao final e exportacao",
    suggestion: nextCheckpoint ? getCheckpointSuggestion(nextCheckpoint.id) : "A estrutura esta forte. Revise o preview final e gere o PDF.",
    primaryStrength: getPrimaryStrength({
      experienceCount,
      projectCount,
      skillCount,
      summaryReady,
      contactCount,
    }),
    counts: {
      experience: experienceCount,
      education: educationCount,
      skills: skillCount,
      languages: languageCount,
      certifications: certificationCount,
      projects: projectCount,
      contacts: contactCount,
      filledSections: filledSectionCount,
    },
  };
}
