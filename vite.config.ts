/// <reference types="vitest" />
import path from 'path';
import { defineConfig, UserConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	base: './',
	plugins: [dts({ rollupTypes: true })],
	test: {
		includeSource: ['src/**/*.{js,ts}'],
		environment: 'happy-dom',
		browser: {
			name: 'chrome',
			enabled: true,
			headless: true,
			provider: 'playwright',
		},
	},
	build: {
		sourcemap: true,
		lib: {
			entry: path.resolve(__dirname, 'src/index.ts'),
			name: 'interactivity-api-helpers',
			formats: ['es'],
			fileName: (_, name) => `${name}.js`,
		},
		rollupOptions: {
			input: {
				index: path.resolve(__dirname, 'src/index.ts'),
				demo: path.resolve(__dirname, 'block/view.ts'),
			},
			external: ['@wordpress/interactivity'],
		},
	},
} satisfies UserConfig);
