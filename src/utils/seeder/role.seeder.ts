import { ALL_PERMISSION, prismaClient, ROLES } from "../../config";
import { logger } from "../logger";

const prisma = prismaClient;

async function RoleSeeder() {
  try {
    const roles = ROLES;
    const permission = ALL_PERMISSION;
    const data: any = [];
    permission.forEach((value) => data.push({ scope: value }));
    await prisma.role.createMany({
      data: [{ roleName: roles.BUSINESS }, { roleName: roles.SUPER_ADMIN }],
    });
    console.log("ROLE SEEDED");
  } catch (error) {
    logger.error("ERROR SEEDING ROLE: ", error);
    process.exit(-1);
  }
}
export async function PermissionSeeder() {
  try {
    const permission = ALL_PERMISSION;
    const data: any = [];
    permission.forEach((value) => data.push({ scope: value }));
    await prisma.permission.createMany({
      data: data,
    });

    console.log("PERMISSION SEED SUCCESS");
  } catch (error) {
    logger.error("ERROR SEEDING PERMISSION: ", error);
  }
}

async function AddAllPermissionToAdmin() {
  try {
    const ids = await prisma.permission.findMany({ select: { id: true } });
    console.log(typeof ids, ids);
    await prisma.role.update({
      where: {
        roleName: "SUPER_ADMIN",
      },
      data: {
        permission: {
          connect: ids,
        },
      },
    });
  } catch (error) {
    logger.error("ERROR WHILE ADDING PERMISSION TO ROLE: ", error);
  }
}

async function seeder() {
  await PermissionSeeder();
  await RoleSeeder();
  await AddAllPermissionToAdmin();
}
seeder();
