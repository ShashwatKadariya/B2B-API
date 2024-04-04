import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import { logger } from "../utils";
import { config } from "./config";

const devSmtpSetup = {
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "czf4zvqb7sluwok7@ethereal.email",
    pass: "Wrdprvmgf6kZK2wy56",
  },
};

let transporter: Transporter | null = null;

if (config.NODE_ENV === "production") {
  transporter = nodemailer.createTransport({
    host: config.email.smtp.SMTP_HOST,
    port: parseInt(config.email.smtp.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.email.smtp.SMTP_USERNAME,
      pass: config.email.smtp.SMTP_PASSWORD,
    },
  });
} else {
  transporter = nodemailer.createTransport(devSmtpSetup);
}
export default transporter;
