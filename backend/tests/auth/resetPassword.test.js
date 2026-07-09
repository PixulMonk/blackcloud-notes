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
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = __importDefault(require("mongoose"));
const testHelpers_1 = require("../../src/lib/testHelpers");
const auth_controller_1 = require("../../src/controllers/auth.controller");
const emails_1 = require("../../src/mailer/emails");
const user_model_1 = require("../../src/models/user.model");
const deleteUserData_1 = __importDefault(require("./../../src/utils/deleteUserData"));
jest.mock('bcrypt');
jest.mock('../../src/models/user.model');
jest.mock('../../src/mailer/emails');
jest.mock('./../../src/utils/deleteUserData');
describe('Reset Password Controller', () => {
    let req;
    let res;
    let next;
    let mockUser;
    const buildReq = (bodyOverrides = {}, paramOverrides = {}) => ({
        params: Object.assign({ token: 'valid-reset-token' }, paramOverrides),
        body: Object.assign({ newAuthToken: 'new-auth-token', newProtectedDEK: 'new-protected-dek', newArgon2Salt: 'new-argon2-salt', argon2Params: {
                memoryCost: 65536,
                timeCost: 3,
                parallelism: 1,
                hashLength: 64,
                type: 2,
            } }, bodyOverrides),
    });
    beforeEach(() => {
        jest.clearAllMocks();
        req = buildReq();
        res = (0, testHelpers_1.buildRes)();
        next = jest.fn();
        mockUser = Object.assign(Object.assign({}, (0, testHelpers_1.buildMockUser)()), { _id: new mongoose_1.default.Types.ObjectId(), resetPasswordToken: 'valid-reset-token', resetPasswordExpiresAt: new Date(Date.now() + 60 * 60 * 1000), save: jest.fn().mockResolvedValue(undefined), toObject: jest
                .fn()
                .mockReturnValue({ name: 'Test User', email: 'test@example.com' }) });
        user_model_1.User.findOne.mockResolvedValue(mockUser);
        emails_1.sendPasswordResetSuccessEmail.mockResolvedValue(undefined);
        bcrypt_1.default.hash.mockResolvedValue('$2b$12$newhashedtoken');
        deleteUserData_1.default.mockResolvedValue(undefined);
    });
    describe('input validation', () => {
        const requiredFields = [
            'newAuthToken',
            'newProtectedDEK',
            'newArgon2Salt',
            'argon2Params',
        ];
        test.each(requiredFields)('throws when %s is missing', (field) => __awaiter(void 0, void 0, void 0, function* () {
            req = buildReq({ [field]: undefined });
            // Gonna type cast to "any" instead; unknown is not enough
            // Just need this test to run. Satisfying the "Request" interface seems too much work for
            // ... what we need to do here
            yield (0, auth_controller_1.resetPassword)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('All fields are required');
        }));
    });
    describe('token validation', () => {
        test('throws when reset token is expired', () => __awaiter(void 0, void 0, void 0, function* () {
            // The controller checks if code is expired by DB query.. So not sure if manipulating time is necessary
            // Returns null if expired
            mockUser.resetPasswordExpiresAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
            user_model_1.User.findOne.mockResolvedValue(null);
            yield (0, auth_controller_1.resetPassword)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('Invalid or expired reset link');
        }));
        test('throws when verification code is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(null);
            req = buildReq({ token: 'incorrect-reset-token' });
            yield (0, auth_controller_1.resetPassword)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('Invalid or expired reset link');
        }));
    });
    describe('database updates', () => {
        test('saves newly hashed token not the raw token', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resetPassword)(req, res, next);
            yield new Promise(process.nextTick);
            expect(mockUser.hashedAuthToken).toBe('$2b$12$newhashedtoken');
            expect(mockUser.hashedAuthToken).not.toBe('new-auth-token');
        }));
        test('saves new credentials to user', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resetPassword)(req, res, next);
            yield new Promise(process.nextTick);
            // Assert that whatever was sent through the request ended up on the user
            // Instead of asserting a specific value
            expect(mockUser.protectedDEK).toBe(req.body.newProtectedDEK);
            expect(mockUser.argon2Salt).toBe(req.body.newArgon2Salt);
            expect(mockUser.argon2Params).toEqual(req.body.argon2Params);
        }));
        test('deleteUserData is called with correct user ID', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resetPassword)(req, res, next);
            yield new Promise(process.nextTick);
            // Note: controller expects a string for _id, so convert to string
            expect(deleteUserData_1.default).toHaveBeenCalledWith(mockUser._id.toString());
        }));
        test('deleteUserData is called before save', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resetPassword)(req, res, next);
            yield new Promise(process.nextTick);
            // TODO: test order
            const deleteOrder = deleteUserData_1.default.mock
                .invocationCallOrder[0];
            const saveOrder = mockUser.save.mock.invocationCallOrder[0];
            expect(deleteOrder).toBeLessThan(saveOrder);
        }));
        test('save is called', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resetPassword)(req, res, next);
            yield new Promise(process.nextTick);
            expect(mockUser.save).toHaveBeenCalled();
        }));
    });
    describe('confirmation email', () => {
        test('sendPasswordResetSuccessEmail is called with correct args', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resetPassword)(req, res, next);
            yield new Promise(process.nextTick);
            expect(emails_1.sendPasswordResetSuccessEmail).toHaveBeenCalledWith('Test User', 'test@example.com');
        }));
        test('sendPasswordResetSuccessEmail is NOT called if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(null);
            yield (0, auth_controller_1.resetPassword)(req, res, next);
            yield new Promise(process.nextTick);
            expect(emails_1.sendPasswordResetSuccessEmail).not.toHaveBeenCalled();
        }));
    });
    describe('response', () => {
        test('returns 200 on success', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resetPassword)(req, res, next);
            yield new Promise(process.nextTick);
            expect(res.status).toHaveBeenCalledWith(200);
        }));
        test('returns success true', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.resetPassword)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            expect(body.success).toBe(true);
        }));
    });
});
