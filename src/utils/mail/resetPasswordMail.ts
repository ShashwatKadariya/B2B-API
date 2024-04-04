import { config } from "../../config";

export function resetPasswordMail(params: { email: string; token: string }) {
  const { email, token } = params;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  link: <a>http://localhost:4000/api/v1/auth/reset-password/${token}</a>
</body>
</html>
`;

  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: "Reset Password Link",
    html: htmlContent,
  };
  return mailOptions;
}
