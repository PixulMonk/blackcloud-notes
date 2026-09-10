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
const cooldownHelpers_1 = require("../../src/utils/cooldownHelpers");
const user_model_1 = require("../../src/models/user.model");
jest.mock('../../src/models/user.model');
jest.mock('../../src/mailer/emails');
jest.mock('../../src/utils/cooldownHelpers');
describe('Forgot Password Controller', () => {
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
        mockUser = Object.assign(Object.assign({}, (0, testHelpers_1.buildMockUser)()), { _id: new mongoose_1.default.Types.ObjectId(), resendCooldowns: {
                passwordReset: new Date(),
                passwordResetResendAttempts: 0,
            }, save: jest.fn().mockResolvedValue(undefined), toObject: jest.fn().mockReturnValue({
                name: 'Test User',
                email: 'test@example.com',
            }) });
        user_model_1.User.findOne.mockResolvedValue(mockUser);
        emails_1.sendPasswordResetEmail.mockResolvedValue(undefined);
        cooldownHelpers_1.getFakeAttempts.mockResolvedValue(0);
    });
    describe('email enumeration protection', () => {
        test('returns generic 200 when user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            req = buildReq({ email: 'does-not-exist@example.com' });
            user_model_1.User.findOne.mockResolvedValue(null);
            yield (0, auth_controller_1.forgotPassword)(req, res, next);
            yield new Promise(process.nextTick);
            expect(res.status).toHaveBeenCalledWith(200);
        }));
        test('returns identical response whether user exists or not', () => __awaiter(void 0, void 0, void 0, function* () {
            const genericMessage = 'If an account with that email exists, you will receive further instructions shortly.';
            // user does not exist
            user_model_1.User.findOne.mockResolvedValue(null);
            yield (0, auth_controller_1.forgotPassword)(req, res, next);
            yield new Promise(process.nextTick);
            const bodyWhenNoUser = res.json.mock.calls[0][0];
            jest.clearAllMocks();
            // user exists
            user_model_1.User.findOne.mockResolvedValue(mockUser);
            yield (0, auth_controller_1.forgotPassword)(req, res, next);
            yield new Promise(process.nextTick);
            const bodyWhenUserExists = res.json.mock.calls[0][0];
            expect(bodyWhenNoUser.message).toBe(genericMessage);
            expect(bodyWhenUserExists.message).toBe(genericMessage);
            expect(bodyWhenNoUser.success).toBe(true);
            expect(bodyWhenUserExists.success).toBe(true);
        }));
    });
    describe('rate limiting', () => {
        test('returns 429 when request is within cooldown period', () => __awaiter(void 0, void 0, void 0, function* () {
            cooldownHelpers_1.getProgressiveCooldown.mockReturnValue(30000);
            yield (0, auth_controller_1.forgotPassword)(req, res, next);
            yield new Promise(process.nextTick);
            expect(res.status).toHaveBeenCalledWith(429);
        }));
        test('includes retryAfter in 429 response', () => __awaiter(void 0, void 0, void 0, function* () {
            cooldownHelpers_1.getProgressiveCooldown.mockReturnValue(30000);
            // call forgotPassword
            // process.nextTick
            yield (0, auth_controller_1.forgotPassword)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            // expect res.status to have been called with 429
            expect(res.status).toHaveBeenCalledWith(429);
            expect(body).toEqual(expect.objectContaining({
                success: false,
                retryAfter: expect.any(Number),
            }));
        }));
        test('resets attempts after 1 hour window', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUser.resendCooldowns.passwordReset = new Date(Date.now() - 90 * 60 * 1000); // 90 mins ago
            mockUser.resendCooldowns.passwordResetResendAttempts = 5;
            user_model_1.User.findOne.mockResolvedValue(mockUser);
            yield (0, auth_controller_1.forgotPassword)(req, res, next);
            yield new Promise(process.nextTick);
            // Final attempt should be 1, not 0, because successful attempts increment by 1
            expect(mockUser.resendCooldowns.passwordResetResendAttempts).toEqual(1);
        }));
    });
    describe('on success', () => {
        test('sends password reset email with correct args', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUser.resendCooldowns.passwordReset = new Date(Date.now() - 2 * 60 * 60 * 1000);
            yield (0, auth_controller_1.forgotPassword)(req, res, next);
            yield new Promise(process.nextTick);
            expect(emails_1.sendPasswordResetEmail).toHaveBeenCalledWith('Test User', 'test@example.com', expect.stringContaining('/reset-password/'));
        }));
        test('returns 200 on success', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUser.resendCooldowns.passwordReset = new Date(Date.now() - 2 * 60 * 60 * 1000);
            yield (0, auth_controller_1.forgotPassword)(req, res, next);
            yield new Promise(process.nextTick);
            expect(res.status).toHaveBeenCalledWith(200);
        }));
    });
    describe('database updates', () => {
        test('increments passwordResetResendAttempts', () => __awaiter(void 0, void 0, void 0, function* () {
            // Need to make sure that the request is made in the past. Or else you will get a 429
            // A failed request does NOT increment the attempts count
            mockUser.resendCooldowns.passwordReset = new Date(Date.now() - 2 * 60 * 60 * 1000);
            mockUser.resendCooldowns.passwordResetResendAttempts = 0;
            user_model_1.User.findOne.mockResolvedValue(mockUser);
            yield (0, auth_controller_1.forgotPassword)(req, res, next);
            yield new Promise(process.nextTick);
            const finalAttempts = mockUser.resendCooldowns.passwordResetResendAttempts;
            expect(finalAttempts).toBe(1);
        }));
    });
});
