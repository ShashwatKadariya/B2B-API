import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import { ApiResponse } from "../utils";
import { RoleService } from "../module/role";

export const verifyRole = (permissionScopes: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const roleId = (req as any).roleId;
      const roleService = new RoleService();
      const unAuthorizesRespone: ApiResponse<{}> = {
        statusCode: httpStatus.UNAUTHORIZED,
        body: { errorMessage: "UNAUTHORIZED" },
      };

      if (!roleId)
        return res
          .status(unAuthorizesRespone.statusCode)
          .send(unAuthorizesRespone.body);
      const permissions = await roleService.permissionFind({
        scope: permissionScopes,
        roleId: roleId,
      });
      if (
        !permissions ||
        permissions.permission.length !== permissionScopes.length
      )
        return res
          .status(unAuthorizesRespone.statusCode)
          .send(unAuthorizesRespone.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};
