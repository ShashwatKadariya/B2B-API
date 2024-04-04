import httpStatus from "http-status";

type apiResponseWithMessage<T> = {
  statusCode: number;
  headers?: Record<string, string>;
  body: { message: T; errorMessage?: never };
};
type apiResponseWithErrorMessage<T> = {
  statusCode: number;
  headers?: Record<string, string>;
  body: { message?: never; errorMessage: T };
};

export type ApiResponse<T> =
  | apiResponseWithMessage<T>
  | apiResponseWithErrorMessage<T>;

export const successResponse: ApiResponse<{}> = {
  statusCode: httpStatus.OK,
  body: { message: "Success" },
};
