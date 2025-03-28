import type { Config } from "@jest/types";
import { pathsToModuleNameMapper } from "ts-jest";

const compilerOptions = {
    paths: {
        "@/*": ["src/*"],
        "@/ports/*": ["src/ports/*"],
        "@/validations/*": ["src/validations/*"],
        "@/errors/*": ["src/errors/*"],
    },
    baseUrl: ".",
};

const config: Config.InitialOptions = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleFileExtensions: ["ts", "js", "json"],
    transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                tsconfig: "tsconfig.json",
                useESM: false,
            },
        ],
    },
    testMatch: ["**/__tests__/**/*.test.ts"],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageReporters: ["text", "lcov"],
};

export default config;
