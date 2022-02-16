export const route = {
	routes: {
		'errors': {
			'path': '/errors',
			'file': '/engine/routes/errors/errors.html',
			'routes': {
				'404': {
					'name': 'error-404',
					'path': '/404',
					'file': '/engine/routes/errors/404/404.html',
					'route': {},
				},
			},
		},
	}
};
