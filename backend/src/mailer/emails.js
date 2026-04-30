"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetSuccessEmail = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendVerificationEmail = exports.sendEmailTemplate = void 0;
const emailTemplates_1 = require("./emailTemplates");
const emailClient_1 = require("./emailClient");
const logoUrl = `${process.env.APP_DOMAIN}/logo/logo-horiz.svg`;
const sendEmailTemplate = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield emailClient_1.emailClient.send({
            to: to,
            subject: subject,
            html: html,
        });
        console.log(`Email sent successfully: To: ${to} Subject: ${subject}`);
    }
    catch (error) {
        throw new Error('Error in sending email');
    }
});
exports.sendEmailTemplate = sendEmailTemplate;
// Spefic email functions
const sendVerificationEmail = (name, email, verificationToken) => __awaiter(void 0, void 0, void 0, function* () {
    const template = emailTemplates_1.VERIFY_EMAIL_TEMPLATE.replace('{name}', name)
        .replace('{verificationToken}', verificationToken)
        .replace('logoUrl', logoUrl);
    yield (0, exports.sendEmailTemplate)(email, 'Verify Your Email', template);
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendWelcomeEmail = (name, email) => __awaiter(void 0, void 0, void 0, function* () {
    const template = emailTemplates_1.WELCOME_EMAIL_TEMPLATE.replace('{name}', name).replace('logoUrl', logoUrl);
    yield (0, exports.sendEmailTemplate)(email, 'Welcome to BlackCloud', template);
});
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = (name, email, resetLink) => __awaiter(void 0, void 0, void 0, function* () {
    const template = emailTemplates_1.FORGOT_PASSWORD_TEMPLATE.replace('{name}', name)
        .replace('{resetLink}', resetLink)
        .replace('logoUrl', logoUrl);
    yield (0, exports.sendEmailTemplate)(email, 'Password Reset', template);
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendPasswordResetSuccessEmail = (name, email) => __awaiter(void 0, void 0, void 0, function* () {
    const template = emailTemplates_1.PASSWORD_RESET_SUCCESS_TEMPLATE.replace('{name}', name).replace('logoUrl', logoUrl);
    yield (0, exports.sendEmailTemplate)(email, 'Your Password Has Been Reset', template);
});
exports.sendPasswordResetSuccessEmail = sendPasswordResetSuccessEmail;
