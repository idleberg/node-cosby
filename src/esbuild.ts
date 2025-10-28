import { rm } from 'node:fs/promises';
import { type BuildOptions, build, context, type Plugin } from 'esbuild';
import consola from './logger.ts';

export async function buildWithOptions(options: BuildOptions, clean = false) {
	console.log(/* let it breathe */);

	if (clean && options.outdir) {
		await cleanOutdir(options.outdir);
	}

	const start = performance.now();

	try {
		await build(options);
	} catch {
		// an error should have printed by now, let's return quietly
		return;
	}

	const end = performance.now();
	const duration = ((end - start) / 1000).toFixed(3);

	consola.success(`Build completed in ${duration}s.`);
}

export async function watchWithOptions(options: BuildOptions, clean = false) {
	let start: number;
	let end: number;

	const watcher: Plugin = {
		name: 'cosby-watcher',
		setup(build) {
			build.onStart(async () => {
				console.log(/* let it breathe */);

				if (clean && options.outdir) {
					await cleanOutdir(options.outdir);
				}

				consola.start('Build started');
				start = performance.now();
			});

			build.onEnd(() => {
				end = performance.now();
				const duration = ((end - start) / 1000).toFixed(3);
				consola.ready(`Build completed in ${duration}s, watching for changes...`);
			});
		},
	};

	const ctx = await context({
		...options,
		plugins: [watcher],
	});

	await ctx.watch({});
}

async function cleanOutdir(outdir: string) {
	consola.info('Cleaning output directory...');
	await rm(outdir, { force: true, recursive: true });
}
