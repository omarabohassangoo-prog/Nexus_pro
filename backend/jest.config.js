module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/server.ts'],
  coverageThreshold: {
    global: { branches: 50, functions: 55, lines: 60, statements: 60 },
  },
  testTimeout: 30000,
  maxWorkers: 1,
};
