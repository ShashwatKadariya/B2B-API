import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateResource } from "../../middleware";
import { LoginSchema } from "./schema";

const authRouter = Router();
const authController = new AuthController();

authRouter.post(
  "/login",
  [validateResource(LoginSchema)],
  authController.login
);
authRouter.post("/logout", authController.logout);
authRouter.get("/refresh", authController.refresh);

export default authRouter;
