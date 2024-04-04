import { CustomError } from "./Custom.error";
import { CustomErrorContent } from "./CustomError.type";

export class BadRequestError extends CustomError {
  static readonly _statusCode = 400;

  readonly statusCode: number;
  readonly errors: CustomErrorContent[] | {};

  constructor(params: { statusCode?: number; errors?: CustomErrorContent[] }) {
    const { statusCode, errors } = params;
    super("BAD REQUEST");

    this.statusCode = statusCode || BadRequestError._statusCode;
    this.errors = errors || [{ message: "BAD REQUEST" }];

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
