#!/usr/bin/env node

import fs from 'node:fs';
import { program } from 'commander';
import { loadEsbuildConfig } from './config.ts';
import { buildWithOptions, watchWithOptions } from './esbuild.ts';
import type { BuildOptions } from './index.ts';
import consola from './logger.ts';

const { version } = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

export function handleCli() {
	program
		.version(version)
		.configureOutput({
			writeErr: (message: string) => consola.error(message),
			writeOut: (message: string) => consola.log(message),
		})
		.option('-w, --watch', 'run in watch mode', false)
		.option('-C, --clean', 'clean outdir before build', false)
		.option('-D, --debug', 'print additional debug info', false)
		.optionsGroup('Config Loader:')
		.option('-c, --cwd <path>', 'set current working directoy', process.cwd())
		.option('-e, --env-name <environment>', 'define environment-specific configuration')
		.option('-d, --dotenv <env file>', 'load .env file')
		.option('-p, --package-json', 'loads config from nearest package.json file', false);

	program.parse();

	return program.opts();
}

export async function main() {
	const options = handleCli();

	if (options.debug) {
		consola.debug('CLI Options\n', JSON.stringify(options, null, 2));
	}

	const cosbyOptions = (await loadEsbuildConfig(options)) as BuildOptions;
	const {
		// ignore these
		$test: _testEnv,
		$development: _developmentEnv,
		$production: _productionEnv,
		$env: _env,
		extends: _baseConfig,

		// this is what we're after
		...esbuildOptions
	} = cosbyOptions;

	if (!esbuildOptions?.entryPoints) {
		throw new Error('No entrypoints have been defined.');
	}

	if (options.debug) {
		consola.debug('Esbuild Config\n', JSON.stringify(esbuildOptions, null, 2));
	}

	if (options.watch) {
		watchWithOptions(esbuildOptions, options.clean);
	} else {
		buildWithOptions(esbuildOptions, options.clean);
	}
}

// [tsdown] Top-level await is currently not supported with the 'cjs' output format.
if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => consola.error(error.message));
}
