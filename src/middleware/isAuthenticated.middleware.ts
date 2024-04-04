import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { verifyJwt } from "../utils/jwt";
import { config } from "../config";
import { ApiResponse } from "../utils";
import { JwtPayload } from "jsonwebtoken";

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization || req.headers.authorization;
  const unAuthorizesRespone: ApiResponse<{}> = {
    statusCode: httpStatus.UNAUTHORIZED,
    body: { errorMessage: "UNAUTHORIZED" },
  };
  if (!authHeader?.startsWith("Bearer")) {
    return res
      .status(unAuthorizesRespone.statusCode)
      .send(unAuthorizesRespone.body);
  }

  const token: string | undefined = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(unAuthorizesRespone.statusCode)
      .send(unAuthorizesRespone.body);
  }

  const decoded: JwtPayload | null = verifyJwt(token, "accessTokenPublicKey");
  if (decoded === null) {
    return res
      .status((unAuthorizesRespone.statusCode = httpStatus.FORBIDDEN))
      .send(unAuthorizesRespone.body);
  }
  (req as any).userId = decoded.userId;
  (req as any).roleId = decoded.roleId;
  next();
}
