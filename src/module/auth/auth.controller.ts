import { Request, Response } from "express";
import { LoginInput } from "./schema";
import { UserService } from "../user";
import { asyncHandler, logger } from "../../utils";
import { BadRequestError } from "../../error";
import httpStatus from "http-status";
import { ApiResponse } from "../../utils";
import { config, refreshTokenCookieConfig, ROLES } from "../../config";
import { clearRefreshTokenCookieConfig } from "../../config";
import { AuthService } from "./auth.service";
import { EmailVerificationService } from "../emailVerification";

export class AuthController {
  private userService: UserService;
  private authService: AuthService;
  private emailVerificationService: EmailVerificationService;

  constructor() {
    this.userService = new UserService();
    this.authService = new AuthService();
    this.emailVerificationService = new EmailVerificationService();
  }

  async loginHandler(req: Request<{}, {}, LoginInput>, res: Response) {
    const body = req.body;
    const cookies = req.cookies;
    //  find user with email
    const userByEmail = await this.userService.findUserByEmail(body.email);
    if (!userByEmail)
      throw new BadRequestError({
        statusCode: httpStatus.UNAUTHORIZED,
        errors: [{ message: "Email or Password is not valid" }],
      });
    //  check to see if the email is verified or not
    if (!userByEmail.emailVerified) {
      throw new BadRequestError({
        statusCode: httpStatus.UNAUTHORIZED,
        errors: [
          { message: "Email is not verified, Please verify your email" },
        ],
      });
    }
    const passwordVerify = await this.userService.verifyPassword(
      body.password,
      userByEmail.password
    );
    if (!passwordVerify) {
      throw new BadRequestError({
        statusCode: httpStatus.UNAUTHORIZED,
        errors: [{ message: "Email or Password is not valid" }],
      });
    }
    // reuse detection
    const tokenInCookie = cookies?.[config.jwt.refresh_token.cookie_name];
    if (tokenInCookie) {
      const foundRefreshToken = await this.authService.findRefreshTokenByToken({
        token: tokenInCookie,
      });
      if (!foundRefreshToken || foundRefreshToken.userId !== userByEmail.id) {
        await this.authService.deleteAllRefreshTokenOfUser({
          userId: userByEmail.id,
        });
      } else {
        await this.authService.deleteRefreshTokenByToken({
          token: tokenInCookie,
        });
      }
      res.clearCookie(
        config.jwt.refresh_token.cookie_name,
        clearRefreshTokenCookieConfig
      );
    }
    const accessToken = this.authService.signAccessToken({
      userId: userByEmail.id,
      roleId: userByEmail.role[0].id,
    });
    const refreshToken = this.authService.signRefreshToken({
      userId: userByEmail.id,
      roleId: userByEmail.role[0].id,
    });
    // store new refresh token in the database
    const refreshTokenDB = await this.authService.createRefreshToken({
      token: refreshToken,
      userId: userByEmail.id,
    });
    // save refresh token in the cookie
    res.cookie(
      config.jwt.refresh_token.cookie_name,
      refreshToken,
      refreshTokenCookieConfig
    );

    const successResponse: ApiResponse<{}> = {
      statusCode: httpStatus.OK,
      body: { message: { token: accessToken } },
    };
    res.status(successResponse.statusCode).send(successResponse.body);
  }

  async logoutHandler(req: Request, res: Response) {
    const cookies = req.cookies;

    const foundRefreshTokenCookie =
      cookies?.[config.jwt.refresh_token.cookie_name];
    if (!foundRefreshTokenCookie) {
      throw new BadRequestError({
        statusCode: httpStatus.NO_CONTENT,
        errors: [{ message: "token not present" }],
      });
    }
    const foundRefreshTokenDb = await this.authService.findRefreshTokenByToken({
      token: foundRefreshTokenCookie,
    });

    if (foundRefreshTokenDb) {
      await this.authService.deleteRefreshTokenByToken({
        token: foundRefreshTokenCookie,
      });
    }
    res.clearCookie(
      config.jwt.refresh_token.cookie_name,
      clearRefreshTokenCookieConfig
    );

    const successResponse: ApiResponse<string> = {
      statusCode: httpStatus.NO_CONTENT,
      body: { message: "" },
    };
    res.status(successResponse.statusCode).send(successResponse.body);
  }

  async refreshHandler(req: Request, res: Response) {
    const refreshToken: string | undefined =
      req.cookies[config.jwt.refresh_token.cookie_name];

    if (!refreshToken)
      throw new BadRequestError({
        statusCode: httpStatus.UNAUTHORIZED,
        errors: [{ message: "UNAUTHORIZED" }],
      });

    // clear refresh cookie
    res.clearCookie(
      config.jwt.refresh_token.cookie_name,
      clearRefreshTokenCookieConfig
    );

    const decoded = this.authService.verifyToken(
      refreshToken,
      "refreshTokenPublicKey"
    );
    if (decoded === null) {
      throw new BadRequestError({
        statusCode: httpStatus.FORBIDDEN,
        errors: [{ message: "FORBIDDEN" }],
      });
    }

    // check for token in the database
    const foundRefreshToken = await this.authService.findRefreshTokenByToken({
      token: refreshToken,
    });

    // if token not in database, we detected token reuse
    // delete all the token of the user
    if (!foundRefreshToken) {
      logger.warn("Attempted refresh token reuse");
      await this.authService.deleteAllRefreshTokenOfUser({
        userId: decoded.userId,
      });
      throw new BadRequestError({
        statusCode: httpStatus.FORBIDDEN,
        errors: [{ message: "FORBIDDEN" }],
      });
    }

    // delete the token from the database
    await this.authService.deleteRefreshTokenByToken({ token: refreshToken });

    const access_token = this.authService.signAccessToken({
      userId: decoded.userId,
      roleId: decoded.roleId,
    });
    const new_refresh_token = this.authService.signRefreshToken({
      userId: decoded.userId,
      roleId: decoded.roleId,
    });

    await this.authService.createRefreshToken({
      token: new_refresh_token,
      userId: decoded.userId,
    });

    res.cookie(
      config.jwt.refresh_token.cookie_name,
      new_refresh_token,
      refreshTokenCookieConfig
    );

    const successResponse: ApiResponse<{}> = {
      statusCode: httpStatus.OK,
      body: { message: { token: access_token } },
    };
    res.status(successResponse.statusCode).send(successResponse.body);
  }

  async registerWithRolesHandler(req: Request<{}, {}, {}>, res: Response) {}

  login = asyncHandler(this.loginHandler.bind(this));
  logout = asyncHandler(this.logoutHandler.bind(this));
  refresh = asyncHandler(this.refreshHandler.bind(this));
  registerWithRoles = asyncHandler(this.registerWithRolesHandler.bind(this));
}
