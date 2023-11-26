module.exports = {
	root: true,
	env: {
		node: true,
		browser: true,
		es6: true,
	},
	extends: [
		'plugin:@react-three/recommended',
		'plugin:react/recommended',
		'eslint:recommended',
	],
	parserOptions: {
		parser: 'babel-eslint',
		sourceType: 'module',
		ecmaVersion: 2020,
		ecmaFeatures: {
			jsx: true,
		},
	},
	plugins: ['@react-three', 'react'],
	rules: {
		'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
		'react/react-in-jsx-scope': 'off',
		'react/jsx-uses-react': 'off',
		'react/prop-types': 'off',
		'@react-three/no-new-in-loop': 'off',
		'no-mixed-spaces-and-tabs': ['warn', 'smart-tabs'],
		'react/no-unknown-property': 'off', // so stupid u
		// 'react/no-unknown-property': ['error', { ignore: [
		// 	'args',
		// 	'position-x',
		// 	'position-y',
		// 	'position-z',
		// 	'rotation-x',
		// 	'rotation-y',
		// 	'rotation-z',
		// 	'scale-x',
		// 	'scale-y',
		// 	'scale-z',
		// ] }],
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
}
