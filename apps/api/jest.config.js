export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.js"],
  testMatch: ["**/tests/**/*.test.js"],
  detectOpenHandles: true,
  extensionsToTreatAsEsm: [".ts"],
  // TS source files are imported with a `.js` specifier (NodeNext convention:
  // the specifier reflects the eventual compiled output, not the source file).
  // This strips `.js` so Jest's own resolver can find the real `.ts` file.
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.json" }],
  },
};
