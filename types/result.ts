export interface SuccessResult<T> {
  success: true;
  data: T;
}

export interface FailureResult {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ServiceResult<T> =
  | SuccessResult<T>
  | FailureResult;