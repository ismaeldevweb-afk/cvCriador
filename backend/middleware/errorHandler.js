export function errorHandler(error, _request, response, _next) {
  const status = error.status ?? 500;
  const isServerError = status >= 500;

  if (isServerError) {
    console.error("Unhandled application error", error);
  }

  response.status(status).json({
    message: isServerError ? "Erro interno do servidor." : error.message ?? "Falha ao processar a requisicao.",
  });
}
