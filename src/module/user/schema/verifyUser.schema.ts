import { string, TypeOf, object } from "zod";

export const VerifyUserSchema = object({
  params: object({
    token: string({ required_error: "token is required" }),
  }),
});

export type VerifyUserInput = TypeOf<typeof VerifyUserSchema>["params"];
