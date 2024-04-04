import { Response, Request } from "express";
import { ApiResponse, asyncHandler } from "../../../utils";
import { RoleService } from "./role.service";
import { createRoleInput } from "./schema";
import httpStatus from "http-status";
import { config } from "../../../config";

export class RoleController {
  private roleService: RoleService;
  constructor() {
    this.roleService = new RoleService();
  }

  async createRoleHandler(
    req: Request<{}, {}, createRoleInput>,
    res: Response
  ) {
    const { roleName, permissions } = req.body;
    // logic: at this step we are already authenticated by middleware
    // so userId exists on the req object

    const userId = (req as any).userId;
    let createRole;
    if (permissions) {
      const permissionsArray = Object.values(permissions);
      createRole = await this.roleService.createRoleByUser({
        roleName,
        permissionScope: permissionsArray,
        userId: userId,
      });
    } else {
      console.log(123);
      createRole = await this.roleService.createRole({
        roleName,
      });
    }

    const successResponse: ApiResponse<{}> = {
      statusCode: httpStatus.OK,
      body: { message: "Roles Created Succesfully" },
    };
    res.status(successResponse.statusCode).send(successResponse.body);
  }
  async getRolesHandler() {}
  async getRoleByIdHandler() {}
  async updateRoleHandler() {}
  async deleteRoleHandler() {}

  createRole = asyncHandler(this.createRoleHandler.bind(this));
  getRoles = asyncHandler(this.getRolesHandler.bind(this));
  getRoleById = asyncHandler(this.getRoleByIdHandler.bind(this));
  updateRole = asyncHandler(this.updateRoleHandler.bind(this));
  deleteRole = asyncHandler(this.deleteRoleHandler.bind(this));
}
