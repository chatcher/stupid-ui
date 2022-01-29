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
		'object-curly-spacing': [
			'error',
			'always',
		],
	},
};
