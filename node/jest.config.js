/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: '(.*\\.(test|spec))\\.ts$',
  testEnvironment: 'node',
  // setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  clearMocks: true,
};
