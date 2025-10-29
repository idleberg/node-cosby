import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadEsbuildConfig } from './config.ts';

// Mock dependencies
vi.mock('c12', () => ({
	loadConfig: vi.fn(),
}));

vi.mock('consola', () => ({
	default: {
		error: vi.fn(),
	},
}));

describe('loadEsbuildConfig', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads config with default options', async () => {
		const { loadConfig } = await import('c12');
		const mockConfig = { entryPoints: ['src/index.ts'], outdir: 'dist' };

		vi.mocked(loadConfig).mockResolvedValue({
			config: mockConfig,
			configFile: undefined,
			layers: [],
		});

		const options = {
			cwd: '/test/path',
		};

		const result = await loadEsbuildConfig(options);

		expect(result).toEqual(mockConfig);
		expect(loadConfig).toHaveBeenCalledWith({
			cwd: '/test/path',
			dotenv: undefined,
			packageJson: undefined,
			name: 'esbuild',
		});
	});

	it('loads config with all options provided', async () => {
		const { loadConfig } = await import('c12');
		const mockConfig = { entryPoints: ['src/app.ts'] };

		vi.mocked(loadConfig).mockResolvedValue({
			config: mockConfig,
			configFile: undefined,
			layers: [],
		});

		const options = {
			cwd: '/custom/path',
			dotenv: '.env.test',
			packageJson: true,
		};

		const result = await loadEsbuildConfig(options);

		expect(result).toEqual(mockConfig);
		expect(loadConfig).toHaveBeenCalledWith({
			cwd: '/custom/path',
			dotenv: '.env.test',
			packageJson: true,
			name: 'esbuild',
		});
	});

	it('exits process when config loading fails', async () => {
		const { loadConfig } = await import('c12');
		const consola = (await import('consola')).default;
		const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

		vi.mocked(loadConfig).mockRejectedValue(new Error('Config not found'));

		const options = { cwd: '/test/path' };

		await loadEsbuildConfig(options);

		expect(consola.error).toHaveBeenCalledWith('Required configuration cannot be resolved.');
		expect(mockExit).toHaveBeenCalledWith(1);

		mockExit.mockRestore();
	});
});
