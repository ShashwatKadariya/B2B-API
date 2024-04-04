"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordMail = void 0;
var config_1 = require("../../config");
function resetPasswordMail(params) {
    var email = params.email, token = params.token;
    var htmlContent = "\n<!DOCTYPE html>\n<html>\n<head>\n  link: <a>http://localhost:4000/api/v1/auth/reset-password/".concat(token, "</a>\n</body>\n</html>\n");
    var mailOptions = {
        from: config_1.config.email.from,
        to: email,
        subject: "Reset Password Link",
        html: htmlContent,
    };
    return mailOptions;
}
exports.resetPasswordMail = resetPasswordMail;
