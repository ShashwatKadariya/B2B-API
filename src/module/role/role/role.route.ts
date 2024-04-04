import { Router } from "express";
import { validateResource } from "../../../middleware";
import { RoleController } from "./role.controller";
import { CreateRoleSchema } from "./schema";
import { verifyRole } from "../../../middleware/verifyRole.middleware";
const roleRouter = Router();
const roleController = new RoleController();

roleRouter
  .route("/")
  .get(verifyRole(["role:read"]), roleController.getRoles)
  .post(verifyRole(["role:read"]), roleController.createRole);

roleRouter.post(
  "/",
  validateResource(CreateRoleSchema),
  verifyRole(["role:create"]),
  roleController.createRole
);

roleRouter
  .route("/:id")
  .get(verifyRole(["role:read"]), roleController.getRoleById)
  .patch(verifyRole(["role:update"]), roleController.updateRole)
  .delete(verifyRole(["role:delete"]), roleController.deleteRole);

export default roleRouter;
