import type { BuildOptions as EsbuildOptions } from 'esbuild';

interface ExtendableBuildOptions extends EsbuildOptions {
	extends?: string;
}

export interface BuildOptions extends ExtendableBuildOptions {
	$development?: ExtendableBuildOptions;
	$test?: ExtendableBuildOptions;
	$production?: ExtendableBuildOptions;
	$env?: {
		[env: string]: ExtendableBuildOptions;
	};
}

/**
 * Defines the configuration for esbuild.
 */
export function defineConfig(config: BuildOptions): BuildOptions {
	return config;
}
