import { Request, Response, NextFunction } from "express";
import { ApiResponse, asyncHandler, logger } from "../../utils";
import { BadRequestError } from "../../error";
import { User } from "@prisma/client";
import { EmailVerificationService } from "../emailVerification";
import { UserService } from "./user.service";
import httpStatus from "http-status";
import {
  ForgotPasswordInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyUserInput,
} from "./schema";
import { AuthService } from "../auth";
import { RoleService } from "../role";
import { ROLES } from "../../config";

export class UserController {
  private userService: UserService;
  private emailVerificationService: EmailVerificationService;
  private authService: AuthService;
  private roleService: RoleService;

  constructor() {
    this.userService = new UserService();
    this.emailVerificationService = new EmailVerificationService();
    this.authService = new AuthService();
    this.roleService = new RoleService();
  }

  async createUserHandler(req: Request<{}, {}, RegisterInput>, res: Response) {
    const { username, email, password } = req.body;
    const body = { username, email, password };

    const newUser = await this.userService.createUser(body);
    // assign business role to user
    await this.roleService.assignRoleToUserId({
      userId: newUser.id,
      roleName: ROLES.BUSINESS,
    });
    // todo: FIX ERROR WHILE USING EXPIRE FROM CONFIG
    const expiresAt = new Date(Date.now() + 3600000);

    // create email verification token
    const verificationToken = await this.emailVerificationService.createToken({
      userId: newUser.id,
      expiresAt: expiresAt,
    });

    // // ADD LATER
    // create queue for sending emails
    // const emailQueue = new Queue("email-queue", {
    //   connection: {
    //     host: "127.0.0.1",
    //     port: 6379,
    //     connectTimeout: 1000,
    //   },
    // });

    // await emailQueue.add(`${Date.now()}`, {
    //   to: newUser.email,
    //   token: verificationToken.token,
    // });

    const mail = this.emailVerificationService
      .sendEmailVeirficationMail(
        {
          email: newUser.email,
          token: verificationToken.token,
        },
        "verifyAccount"
      )
      .catch((error) => logger.error("Err sending email: ", error));

    const successResponse: ApiResponse<User> = {
      statusCode: 200,
      body: { message: newUser },
    };
    res.status(successResponse.statusCode).send(successResponse.body);
  }

  async verifyUserHandler(req: Request<VerifyUserInput>, res: Response) {
    const { token } = req.params;
    const tokenVerified = await this.emailVerificationService.validMailOrNot({
      token,
    });
    if (!tokenVerified) {
      throw new BadRequestError({
        statusCode: httpStatus.NOT_FOUND,
        errors: [{ message: "Not a valid link" }],
      });
    }
    const user = await this.userService.findUserById(tokenVerified.userId);
    if (!user) {
      throw new BadRequestError({
        statusCode: httpStatus.NOT_FOUND,
        errors: [{ message: "user not found" }],
      });
    }
    if (user.emailVerified) {
      throw new BadRequestError({
        statusCode: httpStatus.CONFLICT,
        errors: [{ message: "User already verified" }],
      });
    }
    const updatedUser = await this.userService.updateUser(
      { emailVerified: true },
      user.id
    );

    await this.emailVerificationService.deleteTokenByToken({ token });

    const successResponse: ApiResponse<{}> = {
      statusCode: httpStatus.OK,
      body: { message: "User verified" },
    };
    res.status(successResponse.statusCode).send(successResponse.body);
  }

  async forgotPasswordHandler(
    req: Request<{}, {}, ForgotPasswordInput>,
    res: Response
  ) {
    const { email } = req.body;

    const successResponse: ApiResponse<{}> = {
      statusCode: httpStatus.OK,
      body: { message: "Reset Email sent, please check your email" },
    };
    // check if email exists in the database
    const user = await this.userService.findUserByEmail(email);
    //  check to see if the email is verified or not
    if (!user || !user.emailVerified) {
      // for testing verificaqtion is disabled
      throw new BadRequestError({
        statusCode: httpStatus.UNAUTHORIZED,
        errors: [{ message: "Confirm your email and verify" }],
      });
      // res.sendStatus(successResponse.statusCode).send(successResponse.body);
    }
    const expiresAt = new Date(Date.now() + 3600000);
    const verificationToken = await this.emailVerificationService.createToken({
      userId: user.id,
      expiresAt: expiresAt,
    });

    const mail = this.emailVerificationService
      .sendEmailVeirficationMail(
        {
          email: user.email,
          token: verificationToken.token,
        },
        "resetPassword"
      )
      .catch((error) => logger.error("Err sending email: ", error));

    res.status(successResponse.statusCode).send(successResponse.body);
  }

  async resetPasswordHandler(
    req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
    res: Response
  ) {
    const { token } = req.params;
    const { password } = req.body;
    const resetToken =
      await this.emailVerificationService.findTokenWithExpiryLeft({
        token: token,
      });

    if (!resetToken) {
      throw new BadRequestError({
        statusCode: httpStatus.NOT_FOUND,
        errors: [{ message: "Invalid or expired token" }],
      });
    }
    const userId: string = resetToken.userId;

    const updatedUser = await this.userService.updateUser(
      {
        password,
      },
      userId
    );
    await this.authService.deleteAllRefreshTokenOfUser({ userId });
    await this.emailVerificationService.deleteAllTokensofUser({ userId });

    const successResponse: ApiResponse<{}> = {
      statusCode: httpStatus.OK,
      body: { message: "Password reset Successful" },
    };
    res.status(successResponse.statusCode).send(successResponse.body);
  }

  createUser = asyncHandler(this.createUserHandler.bind(this));
  verifyUser = asyncHandler(this.verifyUserHandler.bind(this));
  forgotPassword = asyncHandler(this.forgotPasswordHandler.bind(this));
  resetPassword = asyncHandler(this.resetPasswordHandler.bind(this));
}
