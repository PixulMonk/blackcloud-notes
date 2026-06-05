import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@blackcloud/shared/(.*)$': '<rootDir>/../shared/src/$1',
    '^@blackcloud/shared$': '<rootDir>/../shared/src/index.ts',
  },
};

export default config;
