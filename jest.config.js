import { createDefaultEsmPreset } from "ts-jest";

const tsJestEsmPreset = createDefaultEsmPreset();

/** @type {import("jest").Config} **/
const config = {
	testEnvironment: "node",
	...tsJestEsmPreset,
	moduleNameMapper: {
		"^#src/(.*)\\.js$": "<rootDir>/src/$1.ts",
		"^#modules/(.*)\\.js$": "<rootDir>/src/modules/$1.ts",
	},
};

export default config;
