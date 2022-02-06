const fs = require('fs/promises');
const path = require('path');
const { findProjectDirectory } = require('./src/find-project-directory');
const { loadProjectConfig } = require('./src/load-project-config');
const { loadProjectPaths } = require('./src/load-project-paths');

const noThrow = async (method) => {
	try {
		return await method();
	} catch (_) {}
};

const fileExists = (filepath) => {
	return noThrow(async () => {
		return (await fs.stat(filepath)).isFile();
	});
};

const directoryExists = (filepath) => {
	return noThrow(async () => {
		return (await fs.stat(filepath)).isDirectory();
	});
};

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

async function check(context, filePath, fileName) {
	// console.debug({ filePath, fileName, cwd: process.cwd() });
	if (await fileExists(filePath)) {
		context.files.push(fileName);
		return fileName;
	}
	return null;
}

const copyFiles = async (src, dest, filter = () => true) => {
	// console.debug('copyFiles', { src, dest });
	if (await directoryExists(src)) {
		const contents = await fs.readdir(src);
		// console.debug({ contents });
		await Promise.all(contents.map((fileName) =>
			copyFiles(
				path.join(src, fileName),
				path.join(dest, fileName),
				filter,
			)
		));
	} else if (await fileExists(src)) {
		const shouldCopy = filter(src);
		// console.debug({ shouldCopy, src });
		if (shouldCopy) {
			await fs.mkdir(path.dirname(dest), { recursive: true });
			await fs.copyFile(src, dest);
		}
	}
};

(async () => {
	const args = Array.from(process.argv).slice(2);

	// const projectDirectory =
	await findProjectDirectory(args); // TODO: rename
	// console.debug({ projectDirectory });

	const projectConfig = await loadProjectConfig();
	// console.debug({ projectConfig });

	const {
		projectRoutesPath,
		projectRootPath,
		projectComponentsPath,
		projectServicesPath,
		projectBuildPath,
	} = await loadProjectPaths(projectConfig);

	await copyRoutes({
		projectRoutesPath,
		projectBuildPath,
		projectRootPath,
	});

	await copyComponents({
		projectComponentsPath,
		projectBuildPath,
	});

	await copyServices({
		projectServicesPath,
		projectBuildPath,
	});

	await copyEngine({
		projectBuildPath,
	});

	// import/run host
	// require('./src/client-server');

	console.debug('failed to explode');
})();

async function copyRoutes({
	projectRoutesPath,
	projectBuildPath,
	projectRootPath,
}) {
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
}

async function copyComponents({
	projectComponentsPath,
	projectBuildPath,
}) {
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
}

async function copyServices({
	projectServicesPath,
	projectBuildPath,
}) {
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
}

async function copyEngine({
	projectBuildPath,
}) {
	await copyFiles(
		path.join(__dirname, 'engine'),
		path.join(projectBuildPath, 'engine'),
	);
}
