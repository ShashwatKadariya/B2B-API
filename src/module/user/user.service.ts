import { PrismaClient, User } from "@prisma/client";
import { prismaClient } from "../../config";
import argon2 from "argon2";
import { logger } from "../../utils";

export class UserService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = prismaClient;
  }

  async createUser(input: {
    username: string;
    email: string;
    password: string;
  }) {
    const hashedPassword = await this.hashPassword(input.password);
    input.password = hashedPassword;
    const newUser = await this.prisma.user.create({
      data: input,
    });
    return newUser;
  }

  async findUserByEmail(email: string) {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        role: true,
      },
    });
    return foundUser;
  }
  async findUserById(id: string) {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    return foundUser;
  }

  async hashPassword(password: string) {
    const hash = await argon2.hash(password);
    return hash;
  }

  async verifyPassword(password: string, hashedPassword: string) {
    if (await argon2.verify(hashedPassword, password)) return true;
    else return false;
  }

  async updateUser(
    params: {
      username?: string;
      email?: string;
      password?: string;
      emailVerified?: boolean;
    },
    id: string
  ) {
    if (params.password) {
      params.password = await this.hashPassword(params.password);
    }

    return await this.prisma.user.update({
      where: { id },
      data: params,
    });
  }

  async updateUserPassword(params: { password: string; userId: string }) {
    const { password, userId } = params;
    const hashedPassword = await this.hashPassword(password);

    return await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
