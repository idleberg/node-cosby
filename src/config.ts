import { loadConfig } from 'c12';
import type { OptionValues } from 'commander';
import consola from 'consola';

export async function loadEsbuildConfig(options: OptionValues) {
	try {
		const { config } = await loadConfig({
			// Map arguments to Esbuild
			cwd: options.cwd,
			dotenv: options.dotenv,
			globalRc: options.globalrc,
			packageJson: options.packageJson,
			rcFile: options.rcfile,

			// Cosby Defaults
			name: 'esbuild',
			configFileRequired: true,
		});

		return config;
	} catch {
		consola.error('Required configuration cannot be resolved.');
		process.exit(1);
	}
}
