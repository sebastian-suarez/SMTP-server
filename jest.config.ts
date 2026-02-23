/* eslint-disable @typescript-eslint/naming-convention */
import { createDefaultEsmPreset } from "ts-jest";
import { type Config } from "jest";

const tsJestEsmPreset = createDefaultEsmPreset();

const config: Config = {
	testEnvironment: "node",
	...tsJestEsmPreset,
	moduleNameMapper: {
		"^#src/(.*)\\.js$": "<rootDir>/src/$1.ts",
		"^#modules/(.*)\\.js$": "<rootDir>/src/modules/$1.ts",
	},
};

export default config;
