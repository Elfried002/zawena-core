/**
 * Erreurs métier standardisées.
 * Client-safe : partagé entre serveur et UI. Aucun détail interne n'est exposé.
 */
export const ErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  DUPLICATE_RESOURCE: "DUPLICATE_RESOURCE",
  INVALID_STATE: "INVALID_STATE",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCodeType = (typeof ErrorCode)[keyof typeof ErrorCode];

export interface AppErrorPayload {
  code: ErrorCodeType;
  message: string;
  details?: Record<string, unknown>;
}

export class AppError extends Error {
  readonly code: ErrorCodeType;
  readonly details?: Record<string, unknown>;

  constructor(code: ErrorCodeType, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "AppError";
    this.code = code;
    if (details) this.details = details;
  }

  toPayload(): AppErrorPayload {
    return this.details
      ? { code: this.code, message: this.message, details: this.details }
      : { code: this.code, message: this.message };
  }
}

export const unauthorized = (m = "Authentification requise") =>
  new AppError(ErrorCode.UNAUTHORIZED, m);
export const forbidden = (m = "Action non autorisée") => new AppError(ErrorCode.FORBIDDEN, m);
export const notFound = (resource = "Ressource") =>
  new AppError(ErrorCode.NOT_FOUND, `${resource} introuvable`);
export const validationError = (m: string, details?: Record<string, unknown>) =>
  new AppError(ErrorCode.VALIDATION_ERROR, m, details);
export const duplicateResource = (m: string, details?: Record<string, unknown>) =>
  new AppError(ErrorCode.DUPLICATE_RESOURCE, m, details);
export const invalidState = (m: string, details?: Record<string, unknown>) =>
  new AppError(ErrorCode.INVALID_STATE, m, details);
export const conflict = (m = "La ressource a été modifiée entre-temps") =>
  new AppError(ErrorCode.CONFLICT, m);
export const rateLimited = (m = "Trop de requêtes, merci de réessayer plus tard") =>
  new AppError(ErrorCode.RATE_LIMITED, m);

/**
 * Normalise n'importe quelle erreur en payload public.
 * Les erreurs inattendues sont journalisées côté serveur et masquées côté client.
 */
export function toPublicError(error: unknown): AppErrorPayload {
  if (error instanceof AppError) return error.toPayload();
  console.error("[AppError:internal]", error);
  return { code: ErrorCode.INTERNAL_ERROR, message: "Une erreur interne est survenue" };
}