const fs = require('fs/promises');
const path = require('path');
const { directoryExists, copyFiles, check } = require('./utilities');

const loadRoutes = async (rootPath, heirarchy = []) => {
	const routes = {};

	const routeName = path.join('/', ...heirarchy);
	const routePath = path.join('/routes', routeName);
	const fullPath = path.join(rootPath, routeName);
	const contents = await fs.readdir(fullPath);

	await Promise.all(contents.map(async (fileName) => {
		const filePath = path.join(fullPath, fileName);

		if (await directoryExists(filePath)) {
			Object.assign(routes, await loadRoutes(rootPath, [...heirarchy, fileName]));
		} else if (/\.(html|js)$/.test(fileName)) {
			const baseFilePath = filePath.replace(/\.(html|js)$/, '');

			const fileBaseName = fileName.replace(/\.(html|js)$/, '');

			const baseName = routeName.replace(/^\//, '').replace(/\W+/g, '-').toLowerCase();
			const name = `${baseName || 'root'}-view`;

			const templatePath = `${baseFilePath}.html`;
			const templateFile = path.join(routePath, `${fileBaseName}.html`);

			const controllerPath = `${baseFilePath}.js`;
			const controllerFile = path.join(routePath, `${fileBaseName}.js`);

			const route = {
				path: routeName,
				name,
				files: [],
			};

			route.template = await check(route, templatePath, templateFile);
			route.controller = await check(route, controllerPath, controllerFile);

			routes[routeName] = route;
		}
	}));

	return routes;
};

module.exports.copyRoutes = async ({
	projectRoutesPath,
	projectBuildPath,
	projectRootPath,
}) => {
	const routes = await loadRoutes(projectRoutesPath);
	console.debug({ routes });
	await fs.writeFile(
		path.join(projectBuildPath, 'routes.js'),
		`export const routes = ${JSON.stringify(routes, null, 2)};\n`,
	);
	await copyFiles(
		projectRoutesPath,
		path.join(projectBuildPath, 'routes'),
		(filePath) => {
			const routeFile = filePath.replace(projectRootPath, '');
			return Object.values(routes)
				.find((route) => route.files.includes(routeFile));
		}
	);
};
