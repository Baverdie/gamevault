export default {
	preset: 'ts-jest/presets/default-esm',
	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				useESM: true,
			},
		],
	},
	testMatch: ['**/__tests__/**/*.test.ts'],
	collectCoverageFrom: [
		'src/**/*.ts',
		'!src/**/*.d.ts',
		'!src/server.ts',
		'!src/config/**',
		'!src/middlewares/**',
	],
	coverageThreshold: {
		global: {
			branches: 10,
			functions: 15,
			lines: 20,
			statements: 20,
		},
	},
};