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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = require("../../src/middleware/auth.middleware");
const user_model_1 = require("../../src/models/user.model");
const testHelpers_1 = require("../../src/lib/testHelpers");
jest.mock('jsonwebtoken');
jest.mock('../../src/models/user.model');
const buildReq = (overrides = {}) => ({
    cookies: Object.assign({ jwt: 'fake-jwt-token' }, overrides),
});
describe('Auth Middleware Test', () => {
    let req;
    let res;
    let next;
    let mockUser;
    let select;
    beforeEach(() => {
        jest.clearAllMocks();
        req = buildReq();
        res = (0, testHelpers_1.buildRes)();
        next = jest.fn();
        select = jest.fn();
        mockUser = Object.assign(Object.assign({}, (0, testHelpers_1.buildMockUser)()), { _id: new mongoose_1.default.Types.ObjectId(), save: jest.fn().mockResolvedValue(undefined) });
        jsonwebtoken_1.default.verify.mockReturnValue({ userId: 'fake-user-id' });
        user_model_1.User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(mockUser),
        });
    });
    describe('input validation', () => {
        test('throws 401 when no token in cookies', () => __awaiter(void 0, void 0, void 0, function* () {
            req = { cookies: {} };
            yield (0, auth_middleware_1.protectRoute)(req, res, next);
            yield new Promise(process.nextTick);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(next.mock.calls[0][0].message).toBe('Unauthorized - No Token Provided');
        }));
    });
    describe('token validation', () => {
        test('throws when token is invalid/tampered', () => __awaiter(void 0, void 0, void 0, function* () {
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new Error('invalid signature');
            });
            yield (0, auth_middleware_1.protectRoute)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        }));
        test('throws when token is expired', () => __awaiter(void 0, void 0, void 0, function* () {
            jsonwebtoken_1.default.verify.mockImplementation(() => {
                throw new Error('jwt expired');
            });
            yield (0, auth_middleware_1.protectRoute)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('jwt expired');
        }));
    });
    describe('user lookup', () => {
        test('throws 404 when user is not found in DB', () => __awaiter(void 0, void 0, void 0, function* () {
            user_model_1.User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null),
            });
            yield (0, auth_middleware_1.protectRoute)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
            expect(next.mock.calls[0][0].message).toBe('User not found');
        }));
    });
    describe('on success', () => {
        test('sets req.user to the found user', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_middleware_1.protectRoute)(req, res, next);
            yield new Promise(process.nextTick);
            expect(req.user).toEqual(mockUser);
        }));
        test('calls next() when everything is valid', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_middleware_1.protectRoute)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledTimes(1);
        }));
        test('does NOT call next() with an error on success', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_middleware_1.protectRoute)(req, res, next);
            yield new Promise(process.nextTick);
            expect(next).toHaveBeenCalledWith(); // called with no arguments
        }));
    });
});
