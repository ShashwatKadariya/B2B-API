import { PrismaClient } from "@prisma/client";
import { config, prismaClient, transporter } from "../../config";
import { randomUUID } from "crypto";
import { resetPasswordMail, verificationMail } from "../../utils/mail";
import * as nodemailer from "nodemailer";
import { logger } from "../../utils";

export class EmailVerificationService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = prismaClient;
  }

  async createToken(params: { userId: string; expiresAt: Date }) {
    const { userId, expiresAt } = params;
    const token: string = randomUUID();

    const verificationToken = await this.prisma.emailVerificationToken.create({
      data: {
        token,
        expiresAt,
        userId,
      },
    });
    return verificationToken;
  }

  async sendEmailVeirficationMail(
    params: { email: string; token: string },
    type: "verifyAccount" | "resetPassword"
  ) {
    const { email, token } = params;
    let mailOptions;
    if (type === "verifyAccount") {
      mailOptions = verificationMail({
        email,
        token,
      });
    } else {
      mailOptions = resetPasswordMail({
        email,
        token,
      });
    }
    const info = await transporter?.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    logger.debug(previewUrl);
  }

  async findTokenWithExpiryLeft(params: { token: string }) {
    const { token } = params;
    return await this.prisma.emailVerificationToken.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() },
      },
    });
  }

  async deleteAllTokensofUser(params: { userId: string }) {
    const { userId } = params;
    await this.prisma.emailVerificationToken.deleteMany({
      where: {
        userId,
      },
    });
  }

  async deleteTokenByToken(params: { token: string }) {
    const { token } = params;
    await this.prisma.emailVerificationToken.deleteMany({
      where: {
        token,
      },
    });
  }

  async validMailOrNot(params: { token: string }) {
    const { token } = params;

    return await this.prisma.emailVerificationToken.findFirst({
      where: {
        token,
      },
    });
  }
}
