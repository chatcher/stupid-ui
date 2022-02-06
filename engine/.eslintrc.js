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
	'rules': {
		'arrow-parens': [
			'error',
			'always',
		],
		'capitalized-comments': 'off',
		'comma-dangle': [
			'error',
		  {
				'arrays': 'always-multiline',
				'objects': 'always-multiline',
				'imports': 'always-multiline',
				'exports': 'never',
				'functions': 'ignore',
			}
		],
		'curly': 'off',
		'object-curly-spacing': [
			'error',
			'always',
		],
	},
};
