import { Prisma } from '@prisma/client';

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: Error | string;
}

type CustomErrorType = ClientError | InternalServerError | ResourceNotFoundError;

export class ClientError extends Error {
  readonly statusCode = 400;
  readonly error = 'Bad request';
  readonly details?: Error | string;
  constructor(message = 'Bad request', error?: Error | string) {
    super(message);
    this.details = error;
  }
}

export class InvalidToken extends Error {
  readonly statusCode = 401;
  readonly error = 'Unauthorized';
  readonly details?: Error | string;
  constructor(
    message = 'invalid token',
    error?: Error | string,
  ) {
    super(message);
    this.details = error;
  }
}

export class InternalServerError extends Error {
  readonly statusCode = 500;
  readonly error = 'Internal server error';
  readonly details?: Error | string;
  constructor(
    message = 'Internal server error. Please contact administrator for more information.',
    error?: Error | string,
  ) {
    super(message);
    this.details = error;
  }
}

export class ResourceNotFoundError extends Error {
  readonly statusCode = 400;
  readonly error = 'Bad request';
  readonly details?: Error | string;
  constructor(message = 'Resource not found', error?: Error | string) {
    super(message);
    this.details = error;
  }
}

/*
 * Parse API error response by Error instance
 */
export function parseErrorResponse(error: Error): ErrorResponse {
  let pharsed: CustomErrorType;
  switch (error.constructor) {
    case Prisma.PrismaClientKnownRequestError:
    case Prisma.PrismaClientUnknownRequestError:
    case Prisma.PrismaClientRustPanicError:
    case Prisma.PrismaClientInitializationError:
    case Prisma.PrismaClientValidationError:
      console.error('DB query execution error.', error);
      pharsed = new InternalServerError(
        'DB query execution error. See https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes for the reference.',
        // TODO: pharse error message
        error,
      );
      break;
    case ResourceNotFoundError:
    case ClientError:
    case InternalServerError:
      console.error('error:', error);
      const e = error as CustomErrorType;
      pharsed = e;
      break;
    case Error:
      console.error('Internal error: ', error);
      pharsed = new InternalServerError('Internal error: ' + error?.message);
      break;
    default:
      console.error('Unknown error: ', error);
      pharsed = new InternalServerError('Unknown error: ' + error?.message);
      break;
  }

  return { statusCode: pharsed.statusCode, error: pharsed.error, message: pharsed.message, details: pharsed.details };
}
