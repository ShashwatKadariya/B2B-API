"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationMail = void 0;
var config_1 = require("../../config");
function verificationMail(params) {
    var email = params.email, token = params.token;
    var htmlContent = "\n<!DOCTYPE html>\n<html>\n<head>\n  link: <a>http://localhost:4000/api/v1/user/verify/".concat(token, "</a>\n</body>\n</html>\n");
    var mailOptions = {
        from: config_1.config.email.from,
        to: email,
        subject: "Email Verification",
        html: htmlContent,
    };
    return mailOptions;
}
exports.verificationMail = verificationMail;
