import type { BuildOptions } from 'esbuild';

export interface ExtendableBuildOptions extends BuildOptions {
	extends?: string;
}

export interface CosbyOptions extends ExtendableBuildOptions {
	$development?: ExtendableBuildOptions;
	$test?: ExtendableBuildOptions;
	$production?: ExtendableBuildOptions;
	$env?: {
		[env: string]: ExtendableBuildOptions;
	};
}

export function defineConfig(config: CosbyOptions): CosbyOptions {
	return config;
}
