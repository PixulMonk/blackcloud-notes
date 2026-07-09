"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateVerificationCode_1 = require("./../../src/utils/generateVerificationCode");
describe('Generate Six Digit Code Unit Test', () => {
    describe('number of digits', () => {
        test('returned int should be six digits', () => {
            const result = (0, generateVerificationCode_1.generateSixDigitCode)();
            expect(String(result)).toHaveLength(6);
        });
    });
    describe('length', () => {
        test('returned int is between 100000 and 999999', () => {
            const result = (0, generateVerificationCode_1.generateSixDigitCode)();
            expect(result).toBeGreaterThanOrEqual(100000);
            expect(result).toBeLessThanOrEqual(999999);
        });
    });
});
