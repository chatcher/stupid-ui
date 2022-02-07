const fs = require('fs/promises');
const path = require('path');
const { directoryExists, copyFiles, check } = require('./utilities');

const loadServices = async (rootPath, heirarchy = []) => {
	const services = {};

	const servicePath = path.join(...heirarchy);
	const searchPath = path.join(rootPath, servicePath);
	const contents = await fs.readdir(searchPath);

	await Promise.all(contents.map(async (fileName) => {
		const sourceFilePath = path.join(searchPath, fileName);

		if (await directoryExists(sourceFilePath)) {
			Object.assign(services, await loadServices(rootPath, [...heirarchy, fileName]));
		} else if (/\.js$/.test(fileName)) {
			const name = fileName
				.replace(/^\/|\.js$/g, '')
				.replace(/\W+/g, '-')
				.toLowerCase()
				.replace(/-(\w)/g, (_, ch) => ch.toUpperCase());

			const serviceFile = path.join('/services', servicePath, fileName);

			const service = {
				name: name.replace(/\b(\w)/g, (_, ch) => ch.toUpperCase()),
				files: [],
			};

			service.service = await check(service, sourceFilePath, serviceFile);

			services[name] = service;
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
