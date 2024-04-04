import httpStatus from "http-status";
import { BadRequestError } from "../../error";
import { UserService } from "../user";
import { EmailVerificationService } from "./emailVerification.service";
import { Request, Response } from "express";
import { date } from "zod";
import { ApiResponse } from "../../utils";
import { AuthService } from "../auth";

export class EmailVerificationController {
  private emailVerificationService: EmailVerificationService;
  private userService: UserService;
  constructor() {
    this.emailVerificationService = new EmailVerificationService();
    this.userService = new UserService();
  }

  async resendMail(req: Request, res: Response) {
    // get email
    const { email } = req.body;
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new BadRequestError({
        statusCode: httpStatus.NOT_FOUND,
        errors: [{ message: "user doesnt exist" }],
      });
    }
    if (user.emailVerified) {
      throw new BadRequestError({
        statusCode: httpStatus.CONFLICT,
        errors: [{ message: "already verified" }],
      });
    }

    // remove all other verification link
    await this.emailVerificationService.deleteAllTokensofUser({
      userId: user.id,
    });
    // generate new token
    const expiresAt = new Date(Date.now() + 3600000);
    const token = await this.emailVerificationService.createToken({
      userId: user.id,
      expiresAt: expiresAt,
    });
    this.emailVerificationService.sendEmailVeirficationMail(
      {
        email: user.email,
        token: token.token,
      },
      "verifyAccount"
    );
    const successResponse: ApiResponse<{}> = {
      statusCode: 200,
      body: { message: "Mail sent again" },
    };
    res.status(successResponse.statusCode).send(successResponse.body);
  }
}
