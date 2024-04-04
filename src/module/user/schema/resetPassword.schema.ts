import { object, TypeOf, string } from "zod";
import { ParamsDictionary } from "express-serve-static-core";

export const ResetPasswordSchema = object({
  params: object({
    token: string({ required_error: "Token is required" }),
  }),
  body: object({
    password: string({ required_error: "Password is required" }).min(6),
    passwordConfirmation: string({
      required_error: "Password confirmation is required",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  }),
});

export type ResetPasswordInput = TypeOf<typeof ResetPasswordSchema>;
