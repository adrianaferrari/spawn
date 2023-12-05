import {defineConfig} from 'vitest/config';
import solid from 'vite-plugin-solid';
import {readFileSync} from 'fs';
import {join} from 'path';

const {devDependencies, peerDependencies, camelCaseName} = JSON.parse(readFileSync('package.json').toString());

export default defineConfig(({mode}) => ({
	plugins: [solid()],
	test: {
		environment: 'jsdom',
		globals: true,
		testTransformMode: {web: ['/.[jt]sx?$/']},
		setupFiles: ['./test/setup.ts'],
		threads: false,
	},
	base: mode === 'pages' ? '/spawn/solid' : undefined,
	build:
		mode === 'pages'
			? {outDir: 'pages'}
			: {
					sourcemap: true,
					lib: {
						formats: ['cjs', 'umd', 'es'],
						entry: join('src', 'lib', 'index.ts'),
						name: camelCaseName,
						fileName: 'index',
					},
					rollupOptions: {
						external: [...Object.keys(devDependencies || {}), ...Object.keys(peerDependencies || {})],
					},
					output: {
						globals: {
							'solid-js': 'SolidJS',
						},
					},
			  },
}));
