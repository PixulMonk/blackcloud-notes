"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// We add this setting to tell nodemailer the host isn't secure during dev
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// Create a test account or replace with real credentials.
exports.transporter = nodemailer_1.default.createTransport({
    host: 'localhost',
    port: 1025, //send via 1025 and open localhost:1080 for MailDev
    secure: false, // true for 465, false for other ports
});
