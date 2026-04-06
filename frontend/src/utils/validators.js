export function validateResume(resume) {
  const errors = {};

  if (!resume.title?.trim()) {
    errors.title = "Informe um titulo para o curriculo.";
  }

  if (!resume.personal.fullName?.trim()) {
    errors.fullName = "Informe seu nome completo.";
  }

  if (!resume.personal.email?.trim()) {
    errors.email = "Informe um email para contato.";
  }

  if (!resume.personal.role?.trim()) {
    errors.role = "Defina um cargo ou objetivo principal.";
  }

  return errors;
}

export function isEmailValid(email = "") {
  return /\S+@\S+\.\S+/.test(email);
}

