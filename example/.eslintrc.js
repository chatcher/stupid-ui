/* eslint-disable */

module.exports = {
	'env': {
		'browser': true,
		'es2021': true,
	},
	'extends': [
		'xo',
	],
	'parserOptions': {
		'ecmaVersion': 'latest',
		'sourceType': 'module',
	},
	'ignorePatterns': [
		'build/**',
	],
	'rules': {
		'capitalized-comments': 'off',
		'object-curly-spacing': [
			'error',
			'always',
		],
		'space-unary-ops': 'off',
	},
};
