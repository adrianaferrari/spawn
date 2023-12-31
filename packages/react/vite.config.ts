import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import {readFileSync} from 'fs';
import {join} from 'path';

const {devDependencies, peerDependencies, camelCaseName} = JSON.parse(readFileSync('package.json').toString());
// https://vitejs.dev/config/
export default defineConfig(({mode}) => ({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		globals: true,
		testTransformMode: {web: ['/.[jt]sx?$/']},
		setupFiles: ['./test/setup.ts'],
		threads: false,
	},
	base: mode === 'pages' ? '/spawn/react' : undefined,
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
						output: {
							globals: {
								react: 'React',
								'react-dom': 'ReactDOM',
							},
						},
					},
			  },
}));
