import { array, object, record, string, TypeOf } from "zod";

export const CreateRoleSchema = object({
  body: object({
    roleName: string(),
    permissions: string().array().optional(),
  }),
});

export type createRoleInput = TypeOf<typeof CreateRoleSchema>["body"];
