/**
 * Security: Sanitizes error messages to prevent information leakage
 * Never expose stack traces, API errors, or system information to users
 */

export type UserFacingError = {
  message: string;
  code?: string;
};

type ApiError = {
  message?: string;
  error?: string;
  statusCode?: number;
  code?: string;
};

// Generic error messages mapped to error codes
const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: "Erreur de connexion. Veuillez vérifier votre connexion internet.",
  UNAUTHORIZED: "Session expirée. Veuillez vous reconnecter.",
  FORBIDDEN: "Vous n'avez pas les permissions nécessaires pour cette action.",
  NOT_FOUND: "La ressource demandée n'a pas été trouvée.",
  VALIDATION_ERROR: "Les données fournies sont invalides. Veuillez vérifier les champs.",
  SERVER_ERROR: "Une erreur serveur est survenue. Veuillez réessayer plus tard.",
  TIMEOUT: "La requête a pris trop de temps. Veuillez réessayer.",
  UNKNOWN: "Une erreur inattendue est survenue.",
};

/**
 * Converts any error to a user-safe error message
 * Prevents leaking sensitive information like stack traces or internal errors
 */
export function toUserError(error: unknown, fallback = ERROR_MESSAGES.UNKNOWN): UserFacingError {
  // Handle null/undefined
  if (!error) {
    return { message: fallback };
  }

  // Handle API errors with status codes
  if (typeof error === "object" && "status" in error) {
    const status = (error as { status: number }).status;

    switch (status) {
      case 401:
        return { message: ERROR_MESSAGES.UNAUTHORIZED, code: "UNAUTHORIZED" };
      case 403:
        return { message: ERROR_MESSAGES.FORBIDDEN, code: "FORBIDDEN" };
      case 404:
        return { message: ERROR_MESSAGES.NOT_FOUND, code: "NOT_FOUND" };
      case 408:
      case 504:
        return { message: ERROR_MESSAGES.TIMEOUT, code: "TIMEOUT" };
      case 422:
        return { message: ERROR_MESSAGES.VALIDATION_ERROR, code: "VALIDATION_ERROR" };
      case 500:
      case 502:
      case 503:
        return { message: ERROR_MESSAGES.SERVER_ERROR, code: "SERVER_ERROR" };
      default:
        return { message: fallback };
    }
  }

  // Handle structured API errors
  if (typeof error === "object" && ("message" in error || "error" in error)) {
    const apiError = error as ApiError;

    // In production, never expose API error messages directly
    if (process.env.NODE_ENV === "production") {
      return { message: fallback, code: apiError.code };
    }

    // In development, show sanitized messages for debugging
    const errorMsg = apiError.message || apiError.error;
    if (errorMsg && typeof errorMsg === "string") {
      // Remove stack traces and sensitive patterns
      const sanitized = errorMsg
        .split("\n")[0] // Take only first line
        .replace(/at\s+.*\(.*\)/g, "") // Remove stack frames
        .replace(/\/[^\s]+/g, "") // Remove file paths
        .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "") // Remove IP addresses
        .trim();

      return { message: sanitized || fallback, code: apiError.code };
    }
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Network errors
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return { message: ERROR_MESSAGES.NETWORK_ERROR, code: "NETWORK_ERROR" };
    }

    // Timeout errors
    if (error.name === "AbortError" || error.message.includes("timeout")) {
      return { message: ERROR_MESSAGES.TIMEOUT, code: "TIMEOUT" };
    }

    // In production, never expose Error messages
    if (process.env.NODE_ENV === "production") {
      return { message: fallback };
    }

    // In development, show sanitized message
    const sanitized = error.message.split("\n")[0].trim();
    return { message: sanitized || fallback };
  }

  // Handle string errors
  if (typeof error === "string") {
    // Never expose raw error strings in production
    if (process.env.NODE_ENV === "production") {
      return { message: fallback };
    }

    const sanitized = error.split("\n")[0].trim();
    return { message: sanitized || fallback };
  }

  // Default fallback for unknown error types
  return { message: fallback };
}

/**
 * Logs errors securely without exposing sensitive data in production
 */
export function logError(error: unknown, context?: string): void {
  if (process.env.NODE_ENV === "development") {
    console.error(`[Error${context ? ` - ${context}` : ""}]:`, error);
  } else {
    // In production, log to monitoring service (Sentry, etc.)
    // For now, log minimal info
    const userError = toUserError(error);
    console.error(`[Error${context ? ` - ${context}` : ""}]:`, {
      message: userError.message,
      code: userError.code,
      timestamp: new Date().toISOString(),
    });
  }
}
