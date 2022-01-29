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
		// 'eslint:recommended',
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
			// 'always',
		  {
        'arrays': 'never',
        'objects': 'always-multiline',
        'imports': 'never',
        'exports': 'never',
        'functions': 'ignore',
    	}
    ],
		'indent': [
			'error',
			'tab',
		],
		'linebreak-style': [
			'error',
			'unix',
		],
		'object-curly-spacing': [
			'error',
			'always',
		],
		'padding-line-between-statements': [
			'off',
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
