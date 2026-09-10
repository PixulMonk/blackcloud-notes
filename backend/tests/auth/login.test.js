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
const user_model_1 = require("../../src/models/user.model");
const bcrypt_1 = __importDefault(require("bcrypt"));
const generateTokenAndSetCookie_1 = require("../../src/utils/generateTokenAndSetCookie");
jest.mock('bcrypt');
jest.mock('../../src/utils/generateTokenAndSetCookie');
jest.mock('../../src/models/user.model');
const buildReq = (overrides = {}) => ({
    body: Object.assign(Object.assign({}, (0, testHelpers_1.buildMockUser)()), overrides),
});
describe('Login Controller', () => {
    let req;
    let res;
    let next;
    let mockUser;
    beforeEach(() => {
        jest.clearAllMocks();
        req = buildReq();
        res = (0, testHelpers_1.buildRes)();
        next = jest.fn();
        mockUser = Object.assign(Object.assign({}, (0, testHelpers_1.buildMockUser)()), { _id: new mongoose_1.default.Types.ObjectId(), hashedAuthToken: '$2b$12$fakehashedtoken', lastLogin: null, save: jest.fn().mockResolvedValue(undefined), toObject: jest.fn().mockReturnValue({
                name: 'Test User',
                email: 'test@example.com',
            }) });
        user_model_1.User.findOne.mockResolvedValue(mockUser); // user exists
        bcrypt_1.default.compare.mockResolvedValue(true); // password matches
        generateTokenAndSetCookie_1.generateTokenAndSetCookie.mockImplementation(() => { });
    });
    describe('input validation', () => {
        const requiredFields = ['email', 'authToken'];
        test.each(requiredFields)('throws when %s is missing', (field) => __awaiter(void 0, void 0, void 0, function* () {
            req = buildReq({ [field]: undefined });
            yield (0, auth_controller_1.login)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('All fields are required');
        }));
    });
    describe('JWT token', () => {
        test('does not generate and set JWT token if authToken is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
            bcrypt_1.default.compare.mockResolvedValueOnce(false);
            const req = buildReq({ authToken: 'incorrect-auth-token' });
            yield (0, auth_controller_1.login)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('Invalid credentials');
            expect(generateTokenAndSetCookie_1.generateTokenAndSetCookie).not.toHaveBeenCalled();
        }));
    });
    describe('error message', () => {
        test('returns Invalid credentials when user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue(null);
            yield (0, auth_controller_1.login)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next.mock.calls[0][0].message).toBe('Invalid credentials');
        }));
        test('returns same error when password is wrong', () => __awaiter(void 0, void 0, void 0, function* () {
            bcrypt_1.default.compare.mockResolvedValueOnce(false);
            yield (0, auth_controller_1.login)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next.mock.calls[0][0].message).toBe('Invalid credentials');
        }));
    });
    describe('response serialization and sanitization', () => {
        const sensitiveFields = [
            'hashedAuthToken',
            'protectedDEK',
            'argon2Salt',
            'argon2Params',
            'verificationToken',
            'verificationTokenExpiresAt',
        ];
        test.each(sensitiveFields)('does not include %s in response', (field) => __awaiter(void 0, void 0, void 0, function* () {
            mockUser.toObject.mockReturnValueOnce({
                name: 'Test User',
                email: 'test@example.com',
                hashedAuthToken: '$2b$12$fakehashedtoken',
                protectedDEK: 'base64encodedDEK==',
                argon2Salt: 'base64encodedSalt==',
                argon2Params: {},
                verificationToken: 123456,
                verificationTokenExpiresAt: Date.now(),
            });
            yield (0, auth_controller_1.login)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            expect(body.user).not.toHaveProperty(field);
        }));
        test('includes safe user fields in response', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.login)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            expect(body.user).toHaveProperty('name', 'Test User');
            expect(body.user).toHaveProperty('email', 'test@example.com');
        }));
    });
    describe('updated credentials', () => {
        test('lastLogin gets updated on successful login', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.login)(req, res, next);
            yield new Promise(process.nextTick);
            expect(mockUser.lastLogin).toBeInstanceOf(Date);
            expect(mockUser.save).toHaveBeenCalled();
        }));
    });
});
