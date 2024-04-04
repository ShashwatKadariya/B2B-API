import { TypeOf, string, object } from "zod";

export const RegisterSchema = object({
  body: object({
    username: string({
      required_error: "Username is required",
    }),
    email: string({
      required_error: "Email is required",
    }).email("Not a valid email"),
    password: string({
      required_error: "Password is required",
    }).min(6, "Password should be minimum 6 characters"),
    passwordConfirmation: string({
      required_error: "Password Confirmation is required",
    }),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: "Password do not match",
    path: ["passwordConfirmation"],
  }),
});

export type RegisterInput = TypeOf<typeof RegisterSchema>["body"];
