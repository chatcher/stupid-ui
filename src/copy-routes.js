const fs = require('fs/promises');
const path = require('path');
const { fileExists, directoryExists, copyFiles, check } = require('./utilities');

const loadRoutes = async (rootPath, heirarchy = []) => {
	const routeName = heirarchy[heirarchy.length - 1] || 'root';
	const route = {
		name: `${routeName}-view`,
		path: path.join('/', ...heirarchy),
		template: null,
		controller: null,
		files: [],
		routes: {},
	};

	const routePath = path.join('/routes', ...heirarchy);
	const baseFilePath = path.join(rootPath, ...heirarchy);
	const contents = await fs.readdir(baseFilePath);

	await Promise.all(contents.map(async (name) => {
		const filePath = path.join(baseFilePath, name);
		const routeFilePath = path.join(routePath, name);

		if (await directoryExists(filePath)) {
			route.routes[name] = await loadRoutes(rootPath, [...heirarchy, name]);
		} else if (new RegExp(`${routeName}\\.html$`).test(name)) {
			route.template = routeFilePath;
			route.files.push(routeFilePath);
		} else if (new RegExp(`${routeName}\\.js$`).test(name)) {
			route.controller = routeFilePath;
			route.files.push(routeFilePath);
		} else {
			console.log(name, 'unknown file');
		}
	}));

	return route;
}

module.exports.copyRoutes = async ({
	projectRoutesPath,
	projectBuildPath,
	projectRootPath,
}) => {
	const routes = await loadRoutes(projectRoutesPath);
	console.debug({ routes });
	await fs.writeFile(
		path.join(projectBuildPath, 'routes.js'),
		`export const route = ${JSON.stringify(routes, null, 2)};\n`,
	);
	await copyFiles(
		projectRoutesPath,
		path.join(projectBuildPath, 'routes'),
		(filePath) => {
			const routeFile = filePath.replace(projectRootPath, '');
			const route = path.dirname(filePath)
				.replace(projectRoutesPath, '')
				.split('/')
				.slice(1)
				.reduce((result, name) => {
					return result && result.routes[name];
				}, routes);
			return route && route.files.includes(routeFile);
		}
	);
};
