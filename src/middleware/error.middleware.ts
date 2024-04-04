import { NextFunction, Request, Response } from "express";
import { ApiResponse, logger } from "../utils";
import { CustomError, CustomErrorContent } from "../error";
import { ZodError, ZodIssue } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ZodError) {
    logger.error(err);
    const errorResponse: ApiResponse<ZodIssue[]> = {
      statusCode: 400,
      body: { errorMessage: err.errors },
    };
    return res.status(errorResponse.statusCode).send(errorResponse.body);
  }
  if (err instanceof CustomError) {
    const { statusCode, errors } = err;
    const errorResponse: ApiResponse<CustomErrorContent[] | {}> = {
      statusCode: 400,
      body: { errorMessage: errors },
    };
    return res.status(errorResponse.statusCode).send(errorResponse.body);
  }
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = err.meta?.target || null;
      let message = "There is unique contraint violation";
      target
        ? (message = `There is unique constraint violation in ${target}`)
        : target;

      const errorResponse: ApiResponse<String> = {
        statusCode: 409,
        body: { errorMessage: message },
      };
      return res.status(errorResponse.statusCode).send(errorResponse.body);
    }
  }
  // unhandled excception
  logger.error(err);
  const errorResponse: ApiResponse<string> = {
    statusCode: 500,
    body: { errorMessage: "Something went wrong" },
  };
  return res.status(errorResponse.statusCode).send(errorResponse.body);
}
