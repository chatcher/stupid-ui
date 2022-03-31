const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { fileExists, directoryExists } = require('./utilities');

const callRouteHandler = (handler) => async (req, res) => {
	try {
		const response = await handler(req);
		res.json(response);
	} catch(error) {
		const status = error.status || 500;
		res.status(status).json({
			error: error.message,
		});
	}
};

async function loadRoutes(rootPath, heirarchy = []) {
	const router = express.Router();

	const routeName = heirarchy[heirarchy.length - 1] || '';
	const pathFragment = `/${routeName.replace(/^_/, ':').replace(/_(\w)/g, (_, ch) => ch.toUpperCase())}`;
	const baseFilePath = path.join(rootPath, ...heirarchy);
	const routerFilePath = `${process.cwd()}/${baseFilePath}/${routeName}.js`;

	const config = await fileExists(routerFilePath) ? require(routerFilePath) : {};
	const route = router.route(pathFragment);
	['get', 'post', 'put', 'patch', 'delete'].forEach((verb) => {
		if (config[verb]) {
			route[verb](callRouteHandler(config[verb]));
		}
	});

	const contents = await fs.readdir(baseFilePath);
	await Promise.all(contents.map(async (name) => {
		if (await directoryExists(path.join(baseFilePath, name))) {
			router.use(pathFragment, await loadRoutes(rootPath, [...heirarchy, name]));
		}
	}));

	return router;
}

module.exports = async () => {
	const router = express.Router();

	router.use(express.json());
	router.use(express.urlencoded({ extended: true }));

	if (await directoryExists('api')) {
		router.use(await loadRoutes('api'));
	}

	router.all('*', (req, res) => {
		console.log('api call');
		const { method, path, params, query, body } = req;
		res.status(404).json({ source: 'default', method, path, params, query, body });
	});

	return router;
};
