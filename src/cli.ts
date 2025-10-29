#!/usr/bin/env node

import fs from 'node:fs';
import { program } from 'commander';
import type { BuildOptions } from 'esbuild';
import { loadEsbuildConfig } from './config.ts';
import { buildWithOptions, watchWithOptions } from './esbuild.ts';
import type { CosbyOptions } from './index.ts';
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
		.option('-d, --debug', 'print additional debug info', false)
		.optionsGroup('Config Loader:')
		.option('-c, --cwd <path>', 'set current working directoy', process.cwd())
		.option('-e, --dotenv <.env file>', 'load .env file')
		.option('-p, --package-json', 'loads config from nearest package.json file', false);

	program.parse();

	return program.opts();
}

export async function main() {
	const options = handleCli();

	if (options.debug) {
		consola.debug('CLI Options\n', JSON.stringify(options, null, 2));
	}

	const cosbyOptions = (await loadEsbuildConfig(options)) as CosbyOptions;
	const { extends: _baseConfig, ...esbuildOptions } = cosbyOptions;

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
	main();
}
