"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@blackcloud/shared/(.*)$': '<rootDir>/../shared/src/$1',
        '^@blackcloud/shared$': '<rootDir>/../shared/src/index.ts',
    },
};
exports.default = config;
