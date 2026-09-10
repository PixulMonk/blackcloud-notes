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
describe('Logout Controller', () => {
    let req;
    let res;
    beforeEach(() => {
        req = {};
        res = (0, testHelpers_1.buildRes)();
    });
    describe('JWT cookie', () => {
        test('clears JWT cookie on logout', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.logout)(req, res);
            expect(res.cookie).toHaveBeenCalledWith('jwt', '', { maxAge: 0 });
        }));
    });
    describe('response', () => {
        test('returns 200 on success', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.logout)(req, res);
            expect(res.status).toHaveBeenCalledWith(200);
        }));
        test('returns success true', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, auth_controller_1.logout)(req, res);
            const body = res.json.mock.calls[0][0];
            expect(body.success).toBe(true);
        }));
    });
});
