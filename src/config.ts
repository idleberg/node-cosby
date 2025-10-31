import { loadConfig, type UserInputConfig } from 'c12';
import type { OptionValues } from 'commander';

export async function loadEsbuildConfig(options: OptionValues) {
	const result: UserInputConfig = await loadConfig({
		// Map arguments to Esbuild
		cwd: options.cwd,
		dotenv: options.dotenv,
		packageJson: options.packageJson,
		envName: options.envName,

		// Cosby Defaults
		name: 'esbuild',
	});

	if (!result._configFile) {
		throw Error('No configuration file found.');
	}

	return result.config;
}
