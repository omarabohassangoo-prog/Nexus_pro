export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational = true;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'طلب غير صالح', code = 'BAD_REQUEST') { return new AppError(msg, 400, code); }
  static unauthorized(msg = 'غير مصرح', code = 'UNAUTHORIZED') { return new AppError(msg, 401, code); }
  static forbidden(msg = 'ممنوع', code = 'FORBIDDEN') { return new AppError(msg, 403, code); }
  static notFound(msg = 'غير موجود', code = 'NOT_FOUND') { return new AppError(msg, 404, code); }
  static conflict(msg = 'تعارض', code = 'CONFLICT') { return new AppError(msg, 409, code); }
  static unprocessable(msg = 'بيانات غير صالحة', code = 'VALIDATION_ERROR', details?: unknown) { return new AppError(msg, 422, code, details); }
  static internal(msg = 'خطأ داخلي', code = 'INTERNAL_ERROR') { return new AppError(msg, 500, code); }
}
