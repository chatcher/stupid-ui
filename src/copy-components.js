const fs = require('fs/promises');
const path = require('path');
const { directoryExists, copyFiles, check } = require('./utilities');

const loadComponents = async (rootPath, heirarchy = []) => {
	const components = {};

	const componentName = path.join(...heirarchy);
	const componentPath = path.join('/components', componentName);
	const fullPath = path.join(rootPath, componentName);
	const contents = await fs.readdir(fullPath);

	await Promise.all(contents.map(async (fileName) => {
		const filePath = path.join(fullPath, fileName);
		if (await directoryExists(filePath)) {
			Object.assign(components, await loadComponents(rootPath, [...heirarchy, fileName]));
		} else if (/\.(html|js)$/.test(fileName)) {
			const baseFilePath = filePath.replace(/\.(html|js)$/, '');

			const fileBaseName = fileName.replace(/\.(html|js)$/, '');

			const name = componentName.replace(/^\//, '').replace(/\W+/g, '-').toLowerCase();

			const templatePath = `${baseFilePath}.html`;
			const templateFile = path.join(componentPath, `${fileBaseName}.html`);

			const controllerPath = `${baseFilePath}.js`;
			const controllerFile = path.join(componentPath, `${fileBaseName}.js`);

			const component = {
				name,
				files: [],
			};

			component.template = await check(component, templatePath, templateFile);
			component.controller = await check(component, controllerPath, controllerFile);

			components[componentName] = component;
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
