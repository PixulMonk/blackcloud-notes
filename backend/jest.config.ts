import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@blackcloud/shared/(.*)$': '<rootDir>/../shared/src/$1',
    '^@blackcloud/shared$': '<rootDir>/../shared/src/index.ts',
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};

export default config;
