export class ErrorWithCode extends Error {
  readonly code: string;
  readonly statusCode: number;

  constructor(code: string, message: string, statusCode: number) {
    super(message);
    this.name = "ErrorWithCode";
    this.code = code;
    this.statusCode = statusCode;
  }

  static Unauthorized(message = "Authentication required"): ErrorWithCode {
    return new ErrorWithCode("UNAUTHORIZED", message, 401);
  }

  static NotFound(message = "Resource not found"): ErrorWithCode {
    return new ErrorWithCode("NOT_FOUND", message, 404);
  }

  static Forbidden(message = "Insufficient permissions"): ErrorWithCode {
    return new ErrorWithCode("FORBIDDEN", message, 403);
  }

  static Conflict(message = "Resource conflict"): ErrorWithCode {
    return new ErrorWithCode("CONFLICT", message, 409);
  }

  static QuotaExceeded(message = "Quota exceeded"): ErrorWithCode {
    return new ErrorWithCode("QUOTA_EXCEEDED", message, 429);
  }

  static RateLimited(message = "Too many requests"): ErrorWithCode {
    return new ErrorWithCode("RATE_LIMITED", message, 429);
  }

  static ValidationError(message = "Validation failed"): ErrorWithCode {
    return new ErrorWithCode("VALIDATION_ERROR", message, 422);
  }
}
