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
	},
};
