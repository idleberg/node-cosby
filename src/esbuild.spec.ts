import { rm } from 'node:fs/promises';
import type { BuildOptions } from 'esbuild';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildWithOptions, watchWithOptions } from './esbuild.ts';

// Mock dependencies
vi.mock('node:fs/promises', () => ({
	rm: vi.fn(),
}));

vi.mock('esbuild', () => ({
	build: vi.fn(),
	context: vi.fn(),
}));

vi.mock('./logger.ts', () => ({
	default: {
		success: vi.fn(),
		info: vi.fn(),
		start: vi.fn(),
		ready: vi.fn(),
	},
}));

describe('buildWithOptions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'log').mockImplementation(() => {});
		vi.spyOn(performance, 'now').mockReturnValue(1000);
	});

	it('builds with basic options', async () => {
		const { build } = await import('esbuild');
		const logger = (await import('./logger.ts')).default;

		vi.mocked(build).mockResolvedValue({} as any);
		vi.spyOn(performance, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(3500);

		const options: BuildOptions = {
			entryPoints: ['src/index.ts'],
			outdir: 'dist',
		};

		await buildWithOptions(options);

		expect(build).toHaveBeenCalledWith(options);
		expect(logger.success).toHaveBeenCalledWith('Build completed in 2.500s.');
	});

	it('cleans outdir before build when clean is true', async () => {
		const { build } = await import('esbuild');
		const logger = (await import('./logger.ts')).default;

		vi.mocked(build).mockResolvedValue({} as any);
		vi.mocked(rm).mockResolvedValue(undefined);

		const options: BuildOptions = {
			entryPoints: ['src/index.ts'],
			outdir: 'dist',
		};

		await buildWithOptions(options, true);

		expect(rm).toHaveBeenCalledWith('dist', { force: true, recursive: true });
		expect(build).toHaveBeenCalledWith(options);
		expect(logger.success).toHaveBeenCalled();
	});

	it('does not clean when clean is false', async () => {
		const { build } = await import('esbuild');

		vi.mocked(build).mockResolvedValue({} as any);

		const options: BuildOptions = {
			entryPoints: ['src/index.ts'],
			outdir: 'dist',
		};

		await buildWithOptions(options, false);

		expect(rm).not.toHaveBeenCalled();
		expect(build).toHaveBeenCalledWith(options);
	});

	it('does not clean when outdir is not specified', async () => {
		const { build } = await import('esbuild');

		vi.mocked(build).mockResolvedValue({} as any);

		const options: BuildOptions = {
			entryPoints: ['src/index.ts'],
			outfile: 'dist/bundle.js',
		};

		await buildWithOptions(options, true);

		expect(rm).not.toHaveBeenCalled();
		expect(build).toHaveBeenCalledWith(options);
	});

	it('handles build errors gracefully', async () => {
		const { build } = await import('esbuild');
		const logger = (await import('./logger.ts')).default;

		vi.mocked(build).mockRejectedValue(new Error('Build failed'));

		const options: BuildOptions = {
			entryPoints: ['src/index.ts'],
			outdir: 'dist',
		};

		await buildWithOptions(options);

		expect(build).toHaveBeenCalledWith(options);
		expect(logger.success).not.toHaveBeenCalled();
	});
});

describe('watchWithOptions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	it('creates watch context with plugin', async () => {
		const { context } = await import('esbuild');
		const mockWatch = vi.fn();
		const mockContext = { watch: mockWatch };

		vi.mocked(context).mockResolvedValue(mockContext as any);

		const options: BuildOptions = {
			entryPoints: ['src/index.ts'],
			outdir: 'dist',
		};

		await watchWithOptions(options);

		expect(context).toHaveBeenCalledWith({
			...options,
			plugins: expect.arrayContaining([
				expect.objectContaining({
					name: 'cosby-watcher',
				}),
			]),
		});
		expect(mockWatch).toHaveBeenCalledWith({});
	});

	it('cleans outdir on watch rebuild when clean is true', async () => {
		const { context } = await import('esbuild');
		const logger = (await import('./logger.ts')).default;
		let onStartCallback: (() => void | Promise<void>) | undefined;

		vi.mocked(rm).mockResolvedValue(undefined);
		vi.mocked(context).mockImplementation(async (opts) => {
			const plugin = (opts.plugins as any)?.[0];
			if (plugin?.setup) {
				plugin.setup({
					onStart: (cb: () => void | Promise<void>) => {
						onStartCallback = cb;
					},
					onEnd: vi.fn(),
				});
			}
			return { watch: vi.fn() } as any;
		});

		const options: BuildOptions = {
			entryPoints: ['src/index.ts'],
			outdir: 'dist',
		};

		await watchWithOptions(options, true);

		if (onStartCallback) {
			await onStartCallback();
		}

		expect(rm).toHaveBeenCalledWith('dist', { force: true, recursive: true });
		expect(logger.start).toHaveBeenCalledWith('Build started');
	});

	it('logs build duration on rebuild completion', async () => {
		const { context } = await import('esbuild');
		const logger = (await import('./logger.ts')).default;
		let onStartCallback: (() => void | Promise<void>) | undefined;
		let onEndCallback: (() => void | Promise<void>) | undefined;

		vi.mocked(context).mockImplementation(async (opts) => {
			const plugin = (opts.plugins as any)?.[0];
			if (plugin?.setup) {
				plugin.setup({
					onStart: (cb: () => void | Promise<void>) => {
						onStartCallback = cb;
					},
					onEnd: (cb: () => void | Promise<void>) => {
						onEndCallback = cb;
					},
				});
			}
			return { watch: vi.fn() } as any;
		});

		vi.spyOn(performance, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(2500);

		const options: BuildOptions = {
			entryPoints: ['src/index.ts'],
			outdir: 'dist',
		};

		await watchWithOptions(options, false);

		if (onStartCallback) {
			await onStartCallback();
		}
		if (onEndCallback) {
			await onEndCallback();
		}

		expect(logger.ready).toHaveBeenCalledWith('Build completed in 1.500s, watching for changes...');
	});
});
