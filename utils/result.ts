import { ServiceResult } from "../types/result";

export function success<T>(
  data: T
): ServiceResult<T> {
  return {
    success: true,
    data,
  };
}

export function failure<T>(
  code: string,
  message: string
): ServiceResult<T> {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}