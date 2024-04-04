import { PrismaClient } from "@prisma/client";
import { prismaClient } from "../../../config";
import { create } from "domain";

export class RoleService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prismaClient;
  }

  async assignRoleToUserId({
    userId,
    roleName,
  }: {
    userId: string;
    roleName: string;
  }) {
    return await this.prisma.role.update({
      where: {
        roleName,
      },
      data: {
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async createRoleByUser(params: {
    roleName: string;
    permissionScope?: string[];
    userId: string;
  }) {
    const { roleName, permissionScope, userId } = params;

    let createdRole;
    if (permissionScope) {
      createdRole = await this.prisma.role.create({
        data: {
          roleName: roleName,
          user: {
            connect: [{ id: userId }],
          },
          permission: {
            connectOrCreate: permissionScope.map((permission) => {
              return {
                create: {
                  scope: permission,
                },
                where: {
                  scope: permission,
                },
              };
            }),
          },
        },
      });
    } else {
      createdRole = await this.createRole({ roleName });
    }

    return createdRole;
  }

  async createRole(params: { roleName: string; permissionScope?: string[] }) {
    const { roleName, permissionScope } = params;
    let createdRole;
    if (permissionScope) {
      createdRole = await this.prisma.role.create({
        data: {
          roleName: roleName,
          permission: {
            connectOrCreate: permissionScope.map((permission) => {
              return {
                create: {
                  scope: permission,
                },
                where: {
                  scope: permission,
                },
              };
            }),
          },
        },
      });
    } else {
      createdRole = await this.prisma.role.create({
        data: {
          roleName: roleName,
        },
      });
    }
    return createdRole;
  }

  async getAllPermissionsFromRoleId(params: { roleId: string }) {
    const { roleId } = params;
    const permissions = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permission: {
          select: {
            scope: true,
          },
        },
      },
    });
    return permissions;
  }
  async assignPermissionsToRole(params: {
    permissionId: { id: string };
    roleId: string;
  }) {
    const { roleId, permissionId } = params;

    const assignedPermissionsToRole = await this.prisma.role.update({
      where: {
        id: roleId,
      },
      data: {
        permission: {
          connect: permissionId,
        },
      },
    });
    return assignedPermissionsToRole;
  }
  async permissionFind(params: { scope: string[]; roleId: string }) {
    const { scope, roleId } = params;
    return await this.prisma.role.findUnique({
      where: {
        id: roleId,
      },
      include: {
        permission: {
          where: {
            scope: {
              in: scope,
            },
          },
        },
      },
    });
  }
}
