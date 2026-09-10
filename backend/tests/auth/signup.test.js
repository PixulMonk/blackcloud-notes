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
const user_model_1 = require("../../src/models/user.model");
const generateTokenAndSetCookie_1 = require("../../src/utils/generateTokenAndSetCookie");
const emails_1 = require("../../src/mailer/emails");
jest.mock('bcrypt');
jest.mock('../../src/models/user.model');
jest.mock('../../src/utils/generateTokenAndSetCookie');
jest.mock('../../src/mailer/emails');
const buildReq = (overrides = {}) => ({
    body: Object.assign(Object.assign({}, (0, testHelpers_1.buildMockUser)()), overrides),
});
describe('Signup Controller', () => {
    let req;
    let res;
    let next;
    let mockUserInstance;
    beforeEach(() => {
        jest.clearAllMocks();
        req = buildReq();
        res = (0, testHelpers_1.buildRes)();
        next = jest.fn();
        // Setup the User constructor mock to capture properties and return a "saved" promise
        user_model_1.User.mockImplementation((data) => {
            mockUserInstance = Object.assign(Object.assign({}, data), { _id: new mongoose_1.default.Types.ObjectId(), save: jest.fn().mockResolvedValue(true), toObject: jest.fn().mockReturnValue({
                    name: data.name,
                    email: data.email,
                    _id: 'mock-id',
                }) });
            return mockUserInstance;
        });
        user_model_1.User.findOne.mockResolvedValue(null);
        bcrypt_1.default.hash.mockResolvedValue('$2b$12$fakehashedtoken');
        generateTokenAndSetCookie_1.generateTokenAndSetCookie.mockImplementation(() => { });
        emails_1.sendVerificationEmail.mockResolvedValue({ success: true });
    });
    describe('input validation', () => {
        const requiredFields = [
            'name',
            'email',
            'authToken',
            'protectedDEK',
            'argon2Salt',
            'argon2Params',
        ];
        test.each(requiredFields)('throws when %s is missing', (field) => __awaiter(void 0, void 0, void 0, function* () {
            req = buildReq({ [field]: undefined });
            yield (0, auth_controller_1.signup)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('All fields are required');
        }));
    });
    describe('duplicate email', () => {
        test('throws when email already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findOne.mockResolvedValue({
                email: 'existing@test.com',
            });
            yield (0, auth_controller_1.signup)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('Unable to create account. Please check your details or try logging in');
        }));
    });
    describe('auth token hashing', () => {
        test('hashes the authToken with bcrypt cost 12', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.signup)(req, res, next);
            expect(bcrypt_1.default.hash).toHaveBeenCalledWith('fake-auth-token-bytes', 12);
        }));
        test('stores the hashed token, not the raw token', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.signup)(req, res, next);
            expect(mockUserInstance.hashedAuthToken).toBe('$2b$12$fakehashedtoken');
        }));
    });
    describe('user persistence', () => {
        test('saves user with correct fields', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.signup)(req, res, next);
            expect(mockUserInstance.name).toBe('Test User');
            expect(mockUserInstance.protectedDEK).toBe('base64encodedDEK==');
        }));
        test('generates a 6-digit verification token', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.signup)(req, res, next);
            expect(Number(mockUserInstance.verificationToken)).toBeGreaterThanOrEqual(100000);
            expect(Number(mockUserInstance.verificationToken)).toBeLessThanOrEqual(999999);
        }));
    });
    describe('jwt generation', () => {
        test('calls generateTokenAndSetCookie after saving user', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.signup)(req, res, next);
            yield new Promise(process.nextTick);
            expect(generateTokenAndSetCookie_1.generateTokenAndSetCookie).toHaveBeenCalledTimes(1);
        }));
        test('does not set JWT cookie if save fails', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.mockImplementationOnce((data) => {
                mockUserInstance = Object.assign(Object.assign({}, data), { save: jest.fn().mockRejectedValue(new Error('DB Error')) });
                return mockUserInstance;
            });
            yield (0, auth_controller_1.signup)(req, res, next);
            expect(generateTokenAndSetCookie_1.generateTokenAndSetCookie).not.toHaveBeenCalled();
        }));
    });
    describe('verification email', () => {
        test('sends verification email with correct args', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.signup)(req, res, next);
            yield new Promise(process.nextTick);
            expect(emails_1.sendVerificationEmail).toHaveBeenCalledWith('Test User', 'test@example.com', expect.any(Number));
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
        test('returns 201 on success', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.signup)(req, res, next);
            yield new Promise(process.nextTick);
            expect(res.status).toHaveBeenCalledWith(201);
        }));
        test('returns success: true', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.signup)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            expect(body.success).toBe(true);
        }));
        test.each(sensitiveFields)('does not include %s in response', (field) => __awaiter(void 0, void 0, void 0, function* () {
            mockUserInstance.toObject.mockReturnValueOnce({
                name: 'Test User',
                email: 'test@example.com',
                hashedAuthToken: '$2b$12$fakehashedtoken',
                protectedDEK: 'base64encodedDEK==',
                argon2Salt: 'base64encodedSalt==',
                argon2Params: {},
                verificationToken: 123456,
                verificationTokenExpiresAt: Date.now(),
            });
            yield (0, auth_controller_1.signup)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            expect(body.user).not.toHaveProperty(field);
        }));
        test('includes safe user fields in response', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.signup)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            expect(body.user).toHaveProperty('name', 'Test User');
            expect(body.user).toHaveProperty('email', 'test@example.com');
        }));
    });
});
