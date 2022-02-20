export const route = {
	'name': 'engine-root-view',
	'path': '/',
	routes: {
		'errors': {
			'name': 'errors-view',
			'path': '/errors',
			'template': '/engine/routes/errors/errors.html',
			'routes': {
				'404': {
					'name': 'error-404-view',
					'path': '/404',
					'template': '/engine/routes/errors/404/404.html',
					'routes': {},
				},
			},
		},
	}
};
