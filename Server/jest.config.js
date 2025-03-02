module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
    testMatch: ["**/tests/**/*.test.js"],
    detectOpenHandles: true,
  };
  