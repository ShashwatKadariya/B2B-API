import jwt from "jsonwebtoken";
import { config } from "../config";
import { logger } from "./logger";

export function signJwt(
  object: Object,
  keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options?: jwt.SignOptions | undefined
) {
  const signInKey = Buffer.from(
    keyName == "accessTokenPrivateKey"
      ? config.jwt.access_token.private_key
      : config.jwt.refresh_token.private_key,
    "base64"
  ).toString("ascii");

  return jwt.sign(object, signInKey, {
    ...(options && options),
    algorithm: "RS256",
  });
}

export function verifyJwt<T>(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
): T | null {
  const publicKey = Buffer.from(
    keyName == "accessTokenPublicKey"
      ? config.jwt.access_token.public_key
      : config.jwt.refresh_token.public_key,
    "base64"
  ).toString("ascii");
  try {
    const decoded = jwt.verify(token, publicKey) as T;
    return decoded;
  } catch (error) {
    return null;
  }
}

export type JwtType = {
  userId: string;
  roleId: {};
};
