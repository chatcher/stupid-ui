module.exports = {
	'env': {
		'node': true,
		'browser': false,
		'commonjs': true,
		'es2021': true,
	},
	'extends': [
		'xo',
	],
	'parserOptions': {
		'ecmaVersion': 'latest',
	},
	'rules': {
		'arrow-body-style': 'off',
		'arrow-parens': [
			'error',
			'always',
		],
		'capitalized-comments': 'off',
		'comma-dangle': [
			'error',
		  {
        'arrays': 'never',
        'objects': 'always-multiline',
        'imports': 'never',
        'exports': 'never',
        'functions': 'ignore',
    	}
    ],
		'object-curly-spacing': [
			'error',
			'always',
		],
		'padding-line-between-statements': [
			'off',
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
