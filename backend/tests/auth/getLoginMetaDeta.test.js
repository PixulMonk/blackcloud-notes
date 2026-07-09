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
Object.defineProperty(exports, "__esModule", { value: true });
const testHelpers_1 = require("../../src/lib/testHelpers");
const auth_controller_1 = require("../../src/controllers/auth.controller");
const user_model_1 = require("../../src/models/user.model");
jest.mock('../../src/models/user.model');
const mockUser = (0, testHelpers_1.buildMockUser)();
describe('Get Login Metadata Controller', () => {
    let req;
    let res;
    let next;
    beforeAll(() => {
        process.env.SALT_HMAC_SECRET = 'fake-hmac-server-secret-key';
    });
    beforeEach(() => {
        res = (0, testHelpers_1.buildRes)();
        next = jest.fn();
        jest.clearAllMocks();
        user_model_1.User.findOne.mockResolvedValue(null);
    });
    describe('input validation', () => {
        test('throws when email is not provided', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = { body: { email: undefined } };
            yield (0, auth_controller_1.getLoginMetadata)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('All fields are required');
        }));
    });
    describe('returned salt', () => {
        test('return correct salt stored in the database if user exists', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = { body: { email: 'test@example.com' } };
            user_model_1.User.findOne.mockResolvedValue(mockUser);
            yield (0, auth_controller_1.getLoginMetadata)(req, res, next);
            yield new Promise(process.nextTick);
            const body = res.json.mock.calls[0][0];
            expect(body).toEqual({
                success: true,
                argon2Salt: 'base64encodedSalt==',
                argon2Params: mockUser.argon2Params,
                protectedDEK: mockUser.protectedDEK,
            });
        }));
        test('returns the same fake salt for the same email if user does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
            const req = {
                body: { email: 'non-existent-user@example.com' },
            };
            yield (0, auth_controller_1.getLoginMetadata)(req, res, next);
            yield new Promise(process.nextTick);
            const firstSalt = res.json.mock.calls[0][0].argon2Salt;
            res = (0, testHelpers_1.buildRes)(); // fresh res for second call
            jest.clearAllMocks();
            yield (0, auth_controller_1.getLoginMetadata)(req, res, next);
            yield new Promise(process.nextTick);
            const secondSalt = res.json.mock.calls[0][0].argon2Salt;
            expect(firstSalt).toEqual(secondSalt);
        }));
        test('returns different fake salts for different emails', () => __awaiter(void 0, void 0, void 0, function* () {
            const req1 = { body: { email: 'alice@example.com' } };
            const req2 = { body: { email: 'bob@example.com' } };
            yield (0, auth_controller_1.getLoginMetadata)(req1, res, next);
            const firstSalt = res.json.mock.calls[0][0].argon2Salt;
            res = (0, testHelpers_1.buildRes)();
            yield (0, auth_controller_1.getLoginMetadata)(req2, res, next);
            const secondSalt = res.json.mock.calls[0][0].argon2Salt;
            expect(firstSalt).not.toEqual(secondSalt);
        }));
    });
});
