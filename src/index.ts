import type { BuildOptions } from 'esbuild';

export interface CosbyOptions extends BuildOptions {
	extends?: string;
}

export function defineConfig(config: CosbyOptions): CosbyOptions {
	return config;
}
