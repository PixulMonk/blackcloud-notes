"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cooldownHelpers_1 = require("../../src/utils/cooldownHelpers");
describe('Check Cooldown Utility Function', () => {
    describe('last sent', () => {
        test('should be allowed if lastSent is undefined', () => {
            const result = (0, cooldownHelpers_1.checkCooldown)(undefined, 30000);
            expect(result.allowed).toBe(true);
        });
    });
    describe('elapsed time', () => {
        test('should be allowed if elapsed time is past cooldown', () => {
            const lastSent = new Date(Date.now() - 60000); // 60 seconds ago
            const result = (0, cooldownHelpers_1.checkCooldown)(lastSent, 30000); // cooldown is 30 seconds
            expect(result.allowed).toBe(true);
        });
        test('should not be allowed if cooldown is still active', () => {
            const lastSent = new Date(Date.now());
            const result = (0, cooldownHelpers_1.checkCooldown)(lastSent, 30000);
            expect(result.allowed).toBe(false);
        });
    });
    describe('return after', () => {
        test('returns retryAfter in seconds when cooldown is active', () => {
            const lastSent = new Date(Date.now() - 10000); // 10 seconds ago
            const result = (0, cooldownHelpers_1.checkCooldown)(lastSent, 30000); // 30 second cooldown
            expect(result.retryAfter).toBe(20); // 30 - 10 = 20 seconds remaining
        });
        test('does not return retryAfter when allowed', () => {
            const result = (0, cooldownHelpers_1.checkCooldown)(undefined, 30000);
            expect(result.retryAfter).toBeUndefined();
        });
    });
});
