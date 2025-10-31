import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies before imports
const mockProgram = {
	version: vi.fn().mockReturnThis(),
	configureOutput: vi.fn().mockReturnThis(),
	option: vi.fn().mockReturnThis(),
	optionsGroup: vi.fn().mockReturnThis(),
	parse: vi.fn().mockReturnThis(),
	opts: vi.fn().mockReturnValue({}),
};

vi.mock('commander', () => ({
	program: mockProgram,
}));

const mockLoadEsbuildConfig = vi.fn();
const mockBuildWithOptions = vi.fn();
const mockWatchWithOptions = vi.fn();
const mockConsola = {
	debug: vi.fn(),
};

vi.mock('./config.ts', () => ({
	loadEsbuildConfig: mockLoadEsbuildConfig,
}));

vi.mock('./esbuild.ts', () => ({
	buildWithOptions: mockBuildWithOptions,
	watchWithOptions: mockWatchWithOptions,
}));

vi.mock('./logger.ts', () => ({
	default: mockConsola,
}));

vi.mock('node:fs', () => ({
	default: {
		readFileSync: vi.fn().mockReturnValue('{"version": "1.0.0"}'),
	},
}));

describe('cli', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset process.argv to avoid interference from actual CLI args
		process.argv = ['node', 'cli.js'];
		// Reset mock return values
		mockProgram.opts.mockReturnValue({});
		mockLoadEsbuildConfig.mockResolvedValue({});
	});

	describe('handleCli', () => {
		it('sets up commander with correct options', async () => {
			const { handleCli } = await import('./cli.ts');

			handleCli();

			expect(mockProgram.version).toHaveBeenCalledWith('1.0.0');
			expect(mockProgram.configureOutput).toHaveBeenCalled();
			expect(mockProgram.option).toHaveBeenCalledWith('-C, --clean', 'clean outdir before build', false);
			expect(mockProgram.option).toHaveBeenCalledWith('-w, --watch', 'run in watch mode', false);
			expect(mockProgram.option).toHaveBeenCalledWith('-D, --debug', 'print additional debug info', false);
			expect(mockProgram.option).toHaveBeenCalledWith(
				'-c, --cwd <path>',
				'set current working directoy',
				process.cwd(),
			);
			expect(mockProgram.option).toHaveBeenCalledWith(
				'-e, --env-name <environment>',
				'define environment-specific configuration',
			);
			expect(mockProgram.option).toHaveBeenCalledWith('-d, --dotenv <env file>', 'load .env file');
			expect(mockProgram.option).toHaveBeenCalledWith(
				'-p, --package-json',
				'loads config from nearest package.json file',
				false,
			);
			expect(mockProgram.optionsGroup).toHaveBeenCalledWith('Config Loader:');
			expect(mockProgram.parse).toHaveBeenCalled();
		});

		it('returns parsed options', async () => {
			const { handleCli } = await import('./cli.ts');
			const expectedOptions = { clean: true, watch: false };

			mockProgram.opts.mockReturnValue(expectedOptions);

			const result = handleCli();

			expect(result).toEqual(expectedOptions);
		});
	});

	describe('main', () => {
		it('calls buildWithOptions when watch is false', async () => {
			const { main } = await import('./cli.ts');
			const mockEsbuildOptions = { entryPoints: ['src/index.ts'], outdir: 'dist' };

			mockProgram.opts.mockReturnValue({
				clean: false,
				watch: false,
				debug: false,
			});

			mockLoadEsbuildConfig.mockResolvedValue(mockEsbuildOptions);

			await main();

			expect(mockLoadEsbuildConfig).toHaveBeenCalled();
			expect(mockBuildWithOptions).toHaveBeenCalledWith(mockEsbuildOptions, false);
		});

		it('calls watchWithOptions when watch is true', async () => {
			const { main } = await import('./cli.ts');
			const mockEsbuildOptions = { entryPoints: ['src/index.ts'], outdir: 'dist' };

			mockProgram.opts.mockReturnValue({
				clean: false,
				watch: true,
				debug: false,
			});

			mockLoadEsbuildConfig.mockResolvedValue(mockEsbuildOptions);

			await main();

			expect(mockLoadEsbuildConfig).toHaveBeenCalled();
			expect(mockWatchWithOptions).toHaveBeenCalledWith(mockEsbuildOptions, false);
		});

		it('passes clean option correctly', async () => {
			const { main } = await import('./cli.ts');
			const mockEsbuildOptions = { entryPoints: ['src/index.ts'], outdir: 'dist' };

			mockProgram.opts.mockReturnValue({
				clean: true,
				watch: false,
				debug: false,
			});

			mockLoadEsbuildConfig.mockResolvedValue(mockEsbuildOptions);

			await main();

			expect(mockBuildWithOptions).toHaveBeenCalledWith(mockEsbuildOptions, true);
		});

		it('logs debug info when debug is true', async () => {
			const { main } = await import('./cli.ts');
			const mockOptions = {
				clean: false,
				watch: false,
				debug: true,
				cwd: '/test/path',
			};

			const mockEsbuildOptions = { entryPoints: ['src/index.ts'], outdir: 'dist' };

			mockProgram.opts.mockReturnValue(mockOptions);
			mockLoadEsbuildConfig.mockResolvedValue(mockEsbuildOptions);

			await main();

			expect(mockConsola.debug).toHaveBeenCalledWith('CLI Options\n', expect.any(String));
			expect(mockConsola.debug).toHaveBeenCalledWith('Esbuild Config\n', expect.any(String));
		});

		it('passes all config loader options to loadEsbuildConfig', async () => {
			const { main } = await import('./cli.ts');
			const mockOptions = {
				clean: false,
				watch: false,
				debug: false,
				cwd: '/custom/path',
				dotenv: '.env.test',
				packageJson: true,
			};

			const mockEsbuildOptions = { entryPoints: ['src/index.ts'] };

			mockProgram.opts.mockReturnValue(mockOptions);
			mockLoadEsbuildConfig.mockResolvedValue(mockEsbuildOptions);

			await main();

			expect(mockLoadEsbuildConfig).toHaveBeenCalledWith(mockOptions);
		});

		it('passes envName option to loadEsbuildConfig', async () => {
			const { main } = await import('./cli.ts');
			const mockOptions = {
				clean: false,
				watch: false,
				debug: false,
				cwd: '/custom/path',
				envName: 'staging',
			};

			const mockEsbuildOptions = { entryPoints: ['src/index.ts'] };

			mockProgram.opts.mockReturnValue(mockOptions);
			mockLoadEsbuildConfig.mockResolvedValue(mockEsbuildOptions);

			await main();

			expect(mockLoadEsbuildConfig).toHaveBeenCalledWith(mockOptions);
		});
	});
});
