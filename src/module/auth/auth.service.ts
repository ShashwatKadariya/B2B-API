import { PrismaClient } from "@prisma/client";
import { config, prismaClient } from "../../config";
import { signJwt, JwtType, verifyJwt } from "../../utils/jwt";

export class AuthService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = prismaClient;
  }

  signAccessToken(payload: JwtType): string {
    const accessToken = signJwt(payload, "accessTokenPrivateKey", {
      expiresIn: config.jwt.access_token.expires_in,
    });
    return accessToken;
  }
  signRefreshToken(payload: JwtType): string {
    const refreshToken = signJwt(payload, "refreshTokenPrivateKey", {
      expiresIn: config.jwt.refresh_token.expires_in,
    });
    return refreshToken;
  }
  verifyToken(
    token: string,
    keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
  ) {
    return verifyJwt<JwtType>(token, keyName);
  }

  async createRefreshToken(data: { token: string; userId: string }) {
    const refreshTokenDB = await this.prisma.refreshToken.create({ data });
    return refreshTokenDB;
  }

  async deleteRefreshTokenByToken({ token }: { token: string }) {
    await this.prisma.refreshToken.delete({ where: { token: token } });
  }

  async findRefreshTokenByToken({ token }: { token: string }) {
    const foundToken = await this.prisma.refreshToken.findUnique({
      where: { token: token },
    });
    return foundToken;
  }

  async deleteAllRefreshTokenOfUser(params: { userId: string }) {
    const { userId } = params;
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    });
  }
}
