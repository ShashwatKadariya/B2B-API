import { PrismaClient } from "@prisma/client";
import { prismaClient } from "../../../config";

export class PermissionService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = prismaClient;
  }
  async createPermission(params: { scope: string }) {
    const { scope } = params;
    const createdPermission = await this.prisma.permission.create({
      data: {
        scope,
      },
    });
    return createdPermission;
  }

  async createManyPermission(params: { scopes: [] }) {
    const { scopes } = params;

    const createdManyPermissions = await this.prisma.permission.createMany({
      data: scopes,
    });
    return createdManyPermissions;
  }
}
