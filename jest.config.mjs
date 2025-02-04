export default {
  moduleNameMapper: {},
  moduleDirectories: ["src", "node_modules"],
  moduleFileExtensions: ["js", "ts"],
  preset: "ts-jest/presets/default-esm",
  setupFiles: ["<rootDir>/setup/jestSetup.js"],
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};
