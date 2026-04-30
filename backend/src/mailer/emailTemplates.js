"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PASSWORD_RESET_SUCCESS_TEMPLATE = exports.FORGOT_PASSWORD_TEMPLATE = exports.WELCOME_EMAIL_TEMPLATE = exports.VERIFY_EMAIL_TEMPLATE = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function loadTemplate(templateName) {
    return fs_1.default.readFileSync(path_1.default.join(__dirname, 'templates', templateName), 'utf-8');
}
exports.VERIFY_EMAIL_TEMPLATE = loadTemplate('verifyEmailTemplate.html');
exports.WELCOME_EMAIL_TEMPLATE = loadTemplate('welcomeEmailTemplate.html');
exports.FORGOT_PASSWORD_TEMPLATE = loadTemplate('passwordResetRequestTemplate.html');
exports.PASSWORD_RESET_SUCCESS_TEMPLATE = loadTemplate('passwordResetSuccessTemplate.html');
