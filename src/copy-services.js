const fs = require('fs/promises');
const path = require('path');
const { directoryExists, copyFiles, check } = require('./utilities');

const loadServices = async (rootPath, heirarchy = []) => {
	const services = {};

	const serviceName = path.join(...heirarchy);
	const servicePath = path.join('/services', serviceName);
	const fullPath = path.join(rootPath, serviceName);
	const contents = await fs.readdir(fullPath);

	await Promise.all(contents.map(async (fileName) => {
		const filePath = path.join(fullPath, fileName);

		if (await directoryExists(filePath)) {
			Object.assign(services, await loadServices(rootPath, [...heirarchy, fileName]));
		} else if (/\.js$/.test(fileName)) {
			const baseFilePath = filePath.replace(/\.js$/, '');

			const fileBaseName = fileName.replace(/\.js$/, '');

			const name = serviceName.replace(/^\//, '').replace(/\W+/g, '-').toLowerCase();

			const controllerPath = `${baseFilePath}.js`;
			const controllerFile = path.join(servicePath, `${fileBaseName}.js`);

			const service = {
				name,
				files: [],
			};

			service.service = await check(service, controllerPath, controllerFile);

			services[serviceName] = service;
		}
	}));

	return services;
};

module.exports.copyServices = async ({
	projectServicesPath,
	projectBuildPath,
}) => {
	const services = await loadServices(projectServicesPath);
	console.debug({ services });
	await fs.writeFile(
		path.join(projectBuildPath, 'services.js'),
		`export const services = ${JSON.stringify(services, null, 2)};\n`,
	);
	await copyFiles(
		projectServicesPath,
		path.join(projectBuildPath, 'services'),
	);
};
