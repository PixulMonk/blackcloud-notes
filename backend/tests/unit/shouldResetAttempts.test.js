"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cooldownHelpers_1 = require("../../src/utils/cooldownHelpers");
describe('Reset Attempts Utility Function', () => {
    const timeWindow = 60 * 60 * 1000; // 1 hour
    describe('last sent', () => {
        test('should return false if last sent date is undefined', () => {
            expect((0, cooldownHelpers_1.shouldResetAttempts)(undefined, timeWindow)).toBe(false);
        });
        test('should return true if window has elapsed', () => {
            const lastSent = new Date(Date.now() - timeWindow * 2); // 2 hours ago
            expect((0, cooldownHelpers_1.shouldResetAttempts)(lastSent, timeWindow)).toBe(true);
        });
    });
    test('should return false if window has not elapsed', () => {
        const lastSent = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
        expect((0, cooldownHelpers_1.shouldResetAttempts)(lastSent, timeWindow)).toBe(false); // 1 hour window
    });
});
