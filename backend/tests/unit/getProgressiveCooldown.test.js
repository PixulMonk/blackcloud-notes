"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cooldownHelpers_1 = require("../../src/utils/cooldownHelpers");
describe('Get Progresive Cooldown Utility Function', () => {
    test('cooldown increases with each attempt', () => {
        expect((0, cooldownHelpers_1.getProgressiveCooldown)(1)).toBeGreaterThan((0, cooldownHelpers_1.getProgressiveCooldown)(0));
        expect((0, cooldownHelpers_1.getProgressiveCooldown)(2)).toBeGreaterThan((0, cooldownHelpers_1.getProgressiveCooldown)(1));
        expect((0, cooldownHelpers_1.getProgressiveCooldown)(3)).toBeGreaterThan((0, cooldownHelpers_1.getProgressiveCooldown)(2));
    });
});
