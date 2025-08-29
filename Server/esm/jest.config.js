export const preset = "ts-jest";
export const testEnvironment = "node";
export const setupFilesAfterEnv = ["<rootDir>/tests/jest.setup.js"];
export const testMatch = ["**/tests/**/*.test.js"];
export const detectOpenHandles = true;
export default {
    preset,
    testEnvironment,
    setupFilesAfterEnv,
    testMatch,
    detectOpenHandles
};
