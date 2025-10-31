import { relative } from 'node:path';
import process from 'node:process';
import { loadConfig, type UserInputConfig } from 'c12';
import type { OptionValues } from 'commander';
import consola from 'consola';

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

	console.log(/* let it breathe */);
	consola.info(`Using configuration ${relative(process.cwd(), result._configFile)}`);

	return result.config;
}
