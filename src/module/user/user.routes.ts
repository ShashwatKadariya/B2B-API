import { Router } from "express";
import { validateResource } from "../../middleware";
import { UserController } from "./user.controller";
import {
  forgotPasswordSchema,
  RegisterSchema,
  ResetPasswordSchema,
  VerifyUserSchema,
} from "./schema";

const userRouter = Router();
const userController = new UserController();

userRouter.post(
  "/",
  validateResource(RegisterSchema),
  userController.createUser
);

userRouter.get(
  "/verify/:token",
  validateResource(VerifyUserSchema),
  userController.verifyUser
);

userRouter.post(
  "/forgot-password",
  validateResource(forgotPasswordSchema),
  userController.forgotPassword
);

userRouter.post(
  "/reset-password/:token",
  validateResource(ResetPasswordSchema),
  userController.resetPassword
);

export default userRouter;
