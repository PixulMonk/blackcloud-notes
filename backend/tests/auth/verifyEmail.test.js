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
jest.mock('../../src/models/user.model');
jest.mock('../../src/mailer/emails');
describe('Verify Email Controller', () => {
    let req;
    let res;
    let next;
    let mockUser;
    const buildReq = (overrides = {}) => ({
        body: Object.assign({ code: '123456' }, overrides),
    });
    beforeEach(() => {
        jest.clearAllMocks();
        req = buildReq();
        res = (0, testHelpers_1.buildRes)();
        next = jest.fn();
        mockUser = Object.assign(Object.assign({}, (0, testHelpers_1.buildMockUser)()), { _id: new mongoose_1.default.Types.ObjectId(), isVerified: false, verificationToken: '123456', verificationTokenExpiresAt: Date.now() + 5 * 60 * 1000, save: jest.fn().mockResolvedValue(undefined), toObject: jest.fn().mockReturnValue({
                name: 'Test User',
                email: 'test@example.com',
            }) });
        user_model_1.User.findOne.mockResolvedValue(mockUser);
        emails_1.sendWelcomeEmail.mockResolvedValue(undefined);
    });
    describe('verification', () => {
        test('should throw when verification code is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(null);
            req = buildReq({ code: '111222' });
            yield (0, auth_controller_1.verifyEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('Invalid or expired verification code');
        }));
        test('should throw when verification code is expired', () => __awaiter(void 0, void 0, void 0, function* () {
            // verifyEmail controller checks if code is expired by DB query: expiry date > time now
            // therefore, DB findOne will return null
            user_model_1.User.findOne.mockResolvedValue(null);
            req = buildReq({ code: '123456' });
            yield (0, auth_controller_1.verifyEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('Invalid or expired verification code');
        }));
        test('should send welcome email upon success', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(mockUser);
            req = buildReq({ code: '123456' });
            yield (0, auth_controller_1.verifyEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(emails_1.sendWelcomeEmail).toHaveBeenCalledWith('Test User', 'test@example.com');
        }));
    });
    describe('database updates', () => {
        test('sets isVerified to true upon success', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(mockUser);
            req = buildReq({ code: '123456' });
            yield (0, auth_controller_1.verifyEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(mockUser.isVerified).toBe(true);
            expect(mockUser.save).toHaveBeenCalled();
        }));
        test('clears verification token and expiry upon success', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(mockUser);
            req = buildReq({ code: '123456' });
            yield (0, auth_controller_1.verifyEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(mockUser.verificationToken).toBeUndefined();
            expect(mockUser.verificationTokenExpiresAt).toBeUndefined();
            expect(mockUser.save).toHaveBeenCalled();
        }));
    });
    describe('on success', () => {
        test('returns 200 on success', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.verifyEmail)(req, res, next);
            yield new Promise(process.nextTick);
            expect(res.status).toHaveBeenCalledWith(200);
        }));
    });
});
