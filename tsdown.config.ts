/**
 * Oh, the irony!
 */
import { defineConfig } from 'tsdown';

export default defineConfig((options) => {
	const isProduction = options.watch !== true;

	return {
		target: 'node20',
		clean: isProduction,
		dts: isProduction,
		entry: ['src/index.ts', 'src/cli.ts'],
		format: ['esm', 'cjs'],
		minify: isProduction,
		outDir: 'lib',
	};
});
