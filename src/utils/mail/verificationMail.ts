import { config } from "../../config";

export function verificationMail(params: { email: string; token: string }) {
  const { email, token } = params;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  link: <a>http://localhost:4000/api/v1/user/verify/${token}</a>
</body>
</html>
`;

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: "Email Verification",
    html: htmlContent,
  };
  return mailOptions;
}
