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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailClient = void 0;
const resend_1 = require("resend");
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_config_1 = require("./nodemailer.config");
dotenv_1.default.config();
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const isResend = process.env.EMAIL_PROVIDER === 'resend';
const sender = {
    name: 'BlackCloud',
    address: process.env.RESEND_SENDER,
};
const resend = new resend_1.Resend(RESEND_API_KEY);
exports.emailClient = {
    send: (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, html }) {
        if (isResend) {
            if (!RESEND_API_KEY) {
                throw new Error('Resend API key not provided.');
            }
            if (!sender) {
                throw new Error('Resend sender not provided.');
            }
            if (!to || !to.includes('@')) {
                throw new Error('Invalid recipient email');
            }
            return resend.emails.send({
                from: `${sender.name} <${sender.address}>`,
                to: [to],
                subject,
                html,
            });
        }
        return nodemailer_config_1.transporter.sendMail({
            from: sender,
            to,
            subject,
            html,
        });
    }),
};
