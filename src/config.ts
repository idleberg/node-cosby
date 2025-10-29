import { loadConfig } from 'c12';
import type { OptionValues } from 'commander';
import consola from 'consola';

export async function loadEsbuildConfig(options: OptionValues) {
	try {
		const result = await loadConfig({
			// Map arguments to Esbuild
			cwd: options.cwd,
			dotenv: options.dotenv,
			packageJson: options.packageJson,

			// Cosby Defaults
			name: 'esbuild',
		});

		console.log(result);

		return result.config;
	} catch {
		consola.error('Required configuration cannot be resolved.');
		process.exit(1);
	}
}
