# @idleberg/cosby

> Delightful esbuild configurations.

[![License](https://img.shields.io/github/license/idleberg/cosby?color=blue&style=for-the-badge)](https://github.com/idleberg/cosby/blob/main/LICENSE)
[![Version: npm](https://img.shields.io/npm/v/@idleberg/cosby?style=for-the-badge)](https://www.npmjs.org/package/@idleberg/cosby)
![GitHub branch check runs](https://img.shields.io/github/check-runs/idleberg/cosby/main?style=for-the-badge)

Cosby allows bundling with `esbuild` while using familiar configuration files, such as `esbuild.config.json` or `esbuild.config.ts`.

> [!NOTE]
> Sounds familiar? This projects has its roots in a similar project called `cosmic-esbuild`. With `cosby`, the main goal was a simplified API while providing more powerful features. But let's read on!

**Features**

- supports [multiple file formats](#configuration)
- [extends](#extending-configuration) from multiple local or git sources
- evaluates [Dotenv](https://github.com/idleberg/node-cosby#dotenv) files
- cleans up before build

## Installation 💿

```shell
npm install @idleberg/cosby
```

## Usage 🚀

### Configuration

<details>
<summary><strong>Supported file formats</strong></summary>

- `esbuild.config.js`
- `esbuild.config.ts`
- `esbuild.config.mjs`
- `esbuild.config.cjs`
- `esbuild.config.mts`
- `esbuild.config.cts`
- `esbuild.config.json`
- `esbuild.config.jsonc`
- `esbuild.config.json5`
- `esbuild.config.yaml`
- `esbuild.config.yml`
- `esbuild.config.toml`

</details>

Example of a purely declarative configuration.

**JSON**

```json
{
	"bundle": true,
	"entryPoints": ["app.js"],
	"outdir": "dist",
	"sourcemap": "external",
}
```

Example of a fully typed configuration.

**TypeScript**

```typescript
import { defineConfig } from '@idleberg/cosby';

export default defineConfig({
	bundle: true,
	entryPoints: ['app.js'],
	outdir: 'dist',
	sourcemap: 'external',
});
```

### CLI

Run from command-line or script.

```sh
# Build
npx cosby

# Watch for changes
npx cosby --watch
```

See `npx cosby --help` for available options.

### Advanced Features

#### Extending Configuration

In a monorepo, you often want to extend from a base configuration.

```typescript
export default defineConfig({
	"extends": "../base",
});
```

Extend from a remote git source.

```typescript
export default defineConfig({
	"extends": "gh:user/repo#branch",
}):
```

#### Dotenv

Run `npx cosby --dotenv .env` to load environment variables from a file.

```typescript
export default defineConfig({
	minify: process.env.NODE_ENV !== 'development'
})
```

## Related 👫

If this project is not for you, maybe these alternatives suit you better:

- [tsup](https://www.npmjs.com/package/tsup)
- [cosmic-esbuild](https://www.npmjs.com/package/cosmic-esbuild)

## License©️

This work is licensed under [The MIT License](LICENSE).
