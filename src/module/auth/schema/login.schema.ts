import { object, string, TypeOf } from "zod";

export const LoginSchema = object({
  body: object({
    email: string({
      required_error: "Email is required",
    }).email("not a valid email"),
    password: string({
      required_error: "Password is required",
    }).min(6, "Password should be minimum 6 characters"),
  }),
});

export type LoginInput = TypeOf<typeof LoginSchema>["body"];
