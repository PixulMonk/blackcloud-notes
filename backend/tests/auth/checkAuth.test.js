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
jest.mock('bcrypt');
jest.mock('../../src/models/user.model');
const buildReq = (overrides = {}) => (Object.assign({ user: new mongoose_1.default.Types.ObjectId().toString() }, overrides));
describe('Check Auth Controller', () => {
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
        // IMPORTANT: checkAuth uses findById not findOne
        // This unit test will fail when someone choses to use findOne but in reality it should be ok
        user_model_1.User.findById.mockResolvedValue(null);
    });
    describe('user validation', () => {
        test('throws when user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockResolvedValue(null);
            yield (0, auth_controller_1.checkAuth)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('User not found');
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
        test('returns 200 on success', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockResolvedValue(mockUser);
            yield (0, auth_controller_1.checkAuth)(req, res, next);
            yield new Promise(process.nextTick);
            expect(res.status).toHaveBeenCalledWith(200);
        }));
        test('returns success: true', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockResolvedValue(mockUser);
            yield (0, auth_controller_1.checkAuth)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            expect(body.success).toBe(true);
        }));
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
            user_model_1.User.findById.mockResolvedValue(mockUser);
            yield (0, auth_controller_1.checkAuth)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            expect(body.user).not.toHaveProperty(field);
        }));
        test('includes safe user fields in response', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockResolvedValue(mockUser);
            yield (0, auth_controller_1.checkAuth)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            expect(body.user).toHaveProperty('name', 'Test User');
            expect(body.user).toHaveProperty('email', 'test@example.com');
        }));
    });
});
