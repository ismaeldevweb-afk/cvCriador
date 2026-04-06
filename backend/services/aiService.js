function compactText(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

export function improveProfessionalText({ text = "", tone = "professional" }) {
  const baseText = compactText(text);

  if (!baseText) {
    return {
      result: "Profissional com postura analitica, foco em resultados e capacidade de gerar impacto consistente em ambientes dinamicos.",
    };
  }

  return {
    result: `${baseText}. Reescrito com tom ${tone}, maior clareza, verbos de impacto e comunicacao mais objetiva.`,
  };
}

export function generateSummary({ fullName = "", title = "", experience = [] }) {
  const latestRole = experience[0]?.role || title || "profissional";

  return {
    result:
      `${fullName || "Profissional"} atua como ${latestRole}, combinando organizacao, aprendizado continuo e foco em entrega.` +
      " Perfil orientado a resultados, colaboracao entre areas e apresentacao profissional consistente.",
  };
}

export function suggestSkills({ targetRole = "" }) {
  const role = targetRole.toLowerCase();

  if (role.includes("design")) {
    return {
      result: ["UX Writing", "Design Systems", "Figma", "Pesquisa com usuarios", "Prototipacao"],
    };
  }

  if (role.includes("dados") || role.includes("analyst")) {
    return {
      result: ["SQL", "Power BI", "Analise exploratoria", "Storytelling com dados", "Excel"],
    };
  }

  return {
    result: ["Comunicacao", "Organizacao", "React", "Node.js", "Resolucao de problemas"],
  };
}

export function rewriteCareerObjective({ targetRole = "", objective = "" }) {
  const baseObjective = compactText(objective);

  return {
    result:
      baseObjective ||
      `Busco uma oportunidade como ${targetRole || "profissional"}, contribuindo com aprendizado rapido, autonomia e foco em resultados.`,
  };
}

