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
const mongoose_1 = __importDefault(require("mongoose"));
const testHelpers_1 = require("../../src/lib/testHelpers");
const auth_controller_1 = require("../../src/controllers/auth.controller");
const emails_1 = require("../../src/mailer/emails");
const user_model_1 = require("../../src/models/user.model");
const cooldownHelpers_1 = require("../../src/utils/cooldownHelpers");
jest.mock('../../src/models/user.model');
jest.mock('../../src/mailer/emails');
jest.mock('../../src/utils/cooldownHelpers');
describe('Resend Verification Email Controller', () => {
    let req;
    let res;
    let next;
    let mockUser;
    const buildReq = (overrides = {}) => ({
        body: Object.assign({ email: 'test@example.com' }, overrides),
    });
    beforeEach(() => {
        jest.clearAllMocks();
        req = buildReq();
        res = (0, testHelpers_1.buildRes)();
        next = jest.fn();
        mockUser = Object.assign(Object.assign({}, (0, testHelpers_1.buildMockUser)()), { _id: new mongoose_1.default.Types.ObjectId(), isVerified: false, resendCooldowns: {
                verification: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                verificationResendAttempts: 0,
            }, save: jest.fn().mockResolvedValue(undefined) });
        user_model_1.User.findOne.mockResolvedValue(mockUser);
        emails_1.sendVerificationEmail.mockResolvedValue(undefined);
        cooldownHelpers_1.getProgressiveCooldown.mockReturnValue(30000);
        cooldownHelpers_1.shouldResetAttempts.mockReturnValue(false);
        cooldownHelpers_1.checkCooldown.mockReturnValue({
            allowed: true,
            retryAfter: null,
        });
    });
    describe('input validation', () => {
        test('throws when email is not provided', () => __awaiter(void 0, void 0, void 0, function* () {
            req = buildReq({ email: undefined });
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('Email is required');
        }));
    });
    describe('user validation', () => {
        test('throws when user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(null);
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next.mock.calls[0][0].message).toBe('User not found');
        }));
        test('throws when user is already verified', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUser.isVerified = true;
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next.mock.calls[0][0].message).toBe('User already verified');
        }));
    });
    describe('rate limiting', () => {
        test('returns 429 when within cooldown period', () => __awaiter(void 0, void 0, void 0, function* () {
            cooldownHelpers_1.checkCooldown.mockReturnValue({
                allowed: false,
                retryAfter: 30,
            });
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(res.status).toHaveBeenCalledWith(429);
        }));
        test('includes retryAfter in 429 response', () => __awaiter(void 0, void 0, void 0, function* () {
            cooldownHelpers_1.checkCooldown.mockReturnValue({
                allowed: false,
                retryAfter: 30,
            });
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            expect(body).toEqual(expect.objectContaining({
                success: false,
                retryAfter: 30,
            }));
        }));
        test('resets attempts after 1 hour window', () => __awaiter(void 0, void 0, void 0, function* () {
            cooldownHelpers_1.shouldResetAttempts.mockReturnValue(true);
            mockUser.resendCooldowns.verificationResendAttempts = 5;
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            // reset to 0 then incremented to 1 on success
            expect(mockUser.resendCooldowns.verificationResendAttempts).toBe(1);
        }));
    });
    describe('database updates', () => {
        test('generates a new 6-digit verification token', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(String(mockUser.verificationToken)).toMatch(/^\d{6}$/);
        }));
        test('sets verificationTokenExpiresAt ~5 minutes from now', () => __awaiter(void 0, void 0, void 0, function* () {
            const before = Date.now();
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            const after = Date.now();
            const expiry = mockUser.verificationTokenExpiresAt.getTime();
            expect(expiry).toBeGreaterThanOrEqual(before + 5 * 60 * 1000 - 100);
            expect(expiry).toBeLessThanOrEqual(after + 5 * 60 * 1000 + 100);
        }));
        test('increments verificationResendAttempts', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUser.resendCooldowns.verificationResendAttempts = 2;
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(mockUser.resendCooldowns.verificationResendAttempts).toBe(3);
        }));
        test('updates verification cooldown timestamp', () => __awaiter(void 0, void 0, void 0, function* () {
            const before = Date.now();
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(mockUser.resendCooldowns.verification).toBeInstanceOf(Date);
            expect(mockUser.resendCooldowns.verification.getTime()).toBeGreaterThanOrEqual(before);
        }));
        test('saves user', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(mockUser.save).toHaveBeenCalled();
        }));
    });
    describe('verification email', () => {
        test('sends verification email with correct args', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(emails_1.sendVerificationEmail).toHaveBeenCalledWith(mockUser.name, mockUser.email, mockUser.verificationToken);
        }));
        test('does not send email if user is already verified', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUser.isVerified = true;
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(emails_1.sendVerificationEmail).not.toHaveBeenCalled();
        }));
        test('does not send email if within cooldown period', () => __awaiter(void 0, void 0, void 0, function* () {
            cooldownHelpers_1.checkCooldown.mockReturnValue({
                allowed: false,
                retryAfter: 30,
            });
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(emails_1.sendVerificationEmail).not.toHaveBeenCalled();
        }));
    });
    describe('response', () => {
        test('returns 200 on success', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(res.status).toHaveBeenCalledWith(200);
        }));
        test('returns success true', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resendVerificationEmail)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            expect(body.success).toBe(true);
        }));
    });
});
