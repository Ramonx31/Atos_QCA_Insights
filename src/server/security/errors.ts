export class SafeApplicationError extends Error {
  constructor(public readonly statusCode: number, public readonly publicMessage: string) {
    super(publicMessage);
  }
}

export const unauthorized = () => new SafeApplicationError(401, "Autenticação necessária.");
export const forbidden = () => new SafeApplicationError(403, "Você não tem permissão para esta ação.");
export const rateLimited = () => new SafeApplicationError(429, "Muitas solicitações. Tente novamente mais tarde.");
export const invalidUpload = () => new SafeApplicationError(400, "Arquivo de upload inválido.");
export const duplicateUpload = () => new SafeApplicationError(409, "Este screenshot já foi enviado.");
export const processingFailed = () => new SafeApplicationError(422, "Não foi possível processar o arquivo enviado.");
export const localOcrUnavailable = () => new SafeApplicationError(503, "O OCR local do Windows não está disponível. Instale o reconhecimento óptico de caracteres em português (Brasil) nas configurações de Idioma do Windows.");

/** Nunca encaminha stack traces, caminhos ou mensagens de fornecedores ao cliente. */
export function toSafeError(error: unknown): SafeApplicationError {
  return error instanceof SafeApplicationError ? error : new SafeApplicationError(500, "Não foi possível concluir a solicitação.");
}
