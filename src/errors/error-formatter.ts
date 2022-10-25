import { GraphQLError } from 'graphql';

export class CustomError extends Error {
  code: number;
  additionalInfo?: string;

  constructor(message: string, code: number, details?: string) {
    super(message);
    this.code = code;
    this.additionalInfo = details;
  }
}

export function formatError(error: GraphQLError) {
  if (error.originalError instanceof CustomError) {
    return {
      message: error.message,
      code: error.originalError.code,
    };
  } else {
    return {
      message: 'Internal Server Error',
      code: 500,
      additionalInfo: error.message,
    };
  }
}
