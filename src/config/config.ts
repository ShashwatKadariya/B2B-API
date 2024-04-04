import * as dotenv from "dotenv";
import path from "path";
import { z } from "zod";

// dotenv config
dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

// env file validation schema
const envSchema = z
  .object({
    NODE_ENV: z.enum(["production", "development", "test"]),
    DATABASE_URL: z.string(),
    PORT: z.string().refine((value) => /^\d+$/.test(value), {
      message: "PORT must contain only digits",
    }),
    SMTP_HOST: z.string(),
    SMTP_PORT: z.string().refine((value) => /^\d+$/.test(value), {
      message: "PORT must contain only digits",
    }),
    SMTP_USERNAME: z.string(),
    SMTP_PASSWORD: z.string(),
    EMAIL_FROM: z.string(),
    EMAIL_EXPIRES: z.string().refine((value) => /^\d+$/.test(value), {
      message: "PORT must contain only digits",
    }),
    REFRESH_TOKEN_COOKIE_NAME: z.string(), // add refinement for base64 encoded string
    ACCESS_TOKEN_PRIVATE_KEY: z.string(),
    ACCESS_TOKEN_PUBLIC_KEY: z.string(),
    REFRESH_TOKEN_PRIVATE_KEY: z.string(),
    REFRESH_TOKEN_PUBLIC_KEY: z.string(),
    ACCESS_TOKEN_EXPIRE: z.string().default("5m"),
    REFRESH_TOKEN_EXPIRE: z.string().default("1d"),
  })
  .required();
type envSchema = z.infer<typeof envSchema>;

// validate the env file with schema and exit on error
const validatedEnv = envSchema.safeParse(process.env);
if (!validatedEnv.success) {
  console.error("ENV FILE ERROR");
  console.error(validatedEnv.error);
  process.exit(1);
}
// config file from validated env file
export const config = {
  NODE_ENV: validatedEnv.data.NODE_ENV,
  PORT: validatedEnv.data.PORT,
  DATABASE_URL: validatedEnv.data.DATABASE_URL,
  email: {
    smtp: {
      SMTP_HOST: validatedEnv.data.SMTP_HOST,
      SMTP_PORT: validatedEnv.data.SMTP_PORT,
      SMTP_USERNAME: validatedEnv.data.SMTP_USERNAME,
      SMTP_PASSWORD: validatedEnv.data.SMTP_PASSWORD,
    },
    from: validatedEnv.data.EMAIL_FROM,
    expires: validatedEnv.data.EMAIL_EXPIRES,
  },
  jwt: {
    access_token: {
      private_key: validatedEnv.data.ACCESS_TOKEN_PRIVATE_KEY,
      public_key: validatedEnv.data.ACCESS_TOKEN_PUBLIC_KEY,
      expires_in: validatedEnv.data.ACCESS_TOKEN_EXPIRE,
    },
    refresh_token: {
      private_key: validatedEnv.data.REFRESH_TOKEN_PRIVATE_KEY,
      public_key: validatedEnv.data.REFRESH_TOKEN_PUBLIC_KEY,
      cookie_name: validatedEnv.data.REFRESH_TOKEN_COOKIE_NAME,
      expires_in: validatedEnv.data.REFRESH_TOKEN_EXPIRE,
    },
  },
} as const;
