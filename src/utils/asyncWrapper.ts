import { Request, Response, NextFunction } from "express";

type ControllerHandler = (
  req: Request<any>, // params ma error xa, aile lai any ma xodeko xu
  res: Response,
  next: NextFunction
) => Promise<void>;

export const asyncHandler = (handler: ControllerHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params as any;
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
