module.exports = {
	'env': {
		'node': true,
		'browser': false,
		'commonjs': true,
		'es2021': true,
	},
	'globals': {
		// 'process': true,
	},
	'extends': [
		'eslint:recommended',
		// 'xo',
	],
	'parserOptions': {
		'ecmaVersion': 'latest',
	},
	'rules': {
		'indent': [
			'error',
			'tab',
		],
		'linebreak-style': [
			'error',
			'unix',
		],
		'quotes': [
			'error',
			'single',
		],
		'semi': [
			'error',
			'always',
			{
				'omitLastInOneLineBlock': true,
			},
		],
	},
};
