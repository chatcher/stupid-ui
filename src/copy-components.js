const fs = require('fs/promises');
const path = require('path');
const { directoryExists, copyFiles, check } = require('./utilities');

const loadComponents = async (rootPath, heirarchy = []) => {
	const components = {};

	const componentPath = path.join(...heirarchy);
	const fullPath = path.join(rootPath, componentPath);
	const contents = await fs.readdir(fullPath);

	await Promise.all(contents.map(async (fileName) => {
		const filePath = path.join(fullPath, fileName);

		if (await directoryExists(filePath)) {
			Object.assign(components, await loadComponents(rootPath, [...heirarchy, fileName]));
		} else if (/\.(html|js)$/.test(fileName)) {
			const baseFilePath = filePath.replace(/\.(html|js)$/, '');
			const fileBaseName = fileName.replace(/\.(html|js)$/, '');

			const templatePath = `${baseFilePath}.html`;
			const templateFile = path.join('/components', componentPath, `${fileBaseName}.html`);

			const controllerPath = `${baseFilePath}.js`;
			const controllerFile = path.join('/components', componentPath, `${fileBaseName}.js`);

			const name = componentPath.replace(/^\//, '').replace(/\W+/g, '-').toLowerCase();
			const component = {
				name,
				files: [],
			};

			component.template = await check(component, templatePath, templateFile);
			component.controller = await check(component, controllerPath, controllerFile);

			components[name] = component;
		}
	}));

	return components;
};

module.exports.copyComponents = async ({
	projectComponentsPath,
	projectBuildPath,
}) => {
	const components = await loadComponents(projectComponentsPath);
	console.debug({ components });
	await fs.writeFile(
		path.join(projectBuildPath, 'components.js'),
		`export const components = ${JSON.stringify(components, null, 2)};\n`,
	);
	await copyFiles(
		projectComponentsPath,
		path.join(projectBuildPath, 'components'),
	);
};
