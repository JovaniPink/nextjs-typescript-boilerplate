import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

/** @type {import("jest").Config} */
const config = {
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/app/layout.tsx", "!src/**/*.d.ts"],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
};

export default createJestConfig(config);
