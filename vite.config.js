import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import eslint from 'vite-plugin-eslint'
import { readFileSync } from 'fs'

const isCodeSandbox = 'SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env

export default {
	plugins: [
		react({
			include: [/\.jsx$/, /\.md$/],
		}),
		{
			name: 'markdown-loader',
			transform(src, id) {
				if (id.endsWith('.md')) {
					// For .md files, return the raw content as a string

					const contents = readFileSync(id, 'utf-8')
					return `export default ${JSON.stringify(contents)};`
				}
			},
		},
		glsl(),
		eslint({
			include: [/\.jsx$/, /\.js$/],
		}),
	],
	root: './src',
	publicDir: './../assets/',
	assetsInclude: ['**/*.md', '**/*.glb'],
	base: './',
	server: {
		host: true,
		open: !isCodeSandbox, // Open if it's not a CodeSandbox
	},
	build: {
		outDir: '../dist',
		assetsDir: './',
		emptyOutDir: true,
		sourcemap: true,
	},
}
