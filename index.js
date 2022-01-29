const fs = require('fs/promises');
const path = require('path');

const noThrow = async (method) => { try { return await method() } catch (_) {/* empty */} };

const fileExists = async (filepath) => {
	return await noThrow(async () => {
		return (await fs.stat(filepath)).isFile();
	});
};

const directoryExists = async (filepath) => {
	return await noThrow(async () => {
		return (await fs.stat(filepath)).isDirectory();
	});
};

const loadRoutes = async (rootPath, heirarchy = []) => {
	const routes = {};

	const routeName = path.join('/', ...heirarchy);
	const routePath = path.join('/routes', routeName);
	const fullPath = path.join(rootPath, routeName);
	const contents = await fs.readdir(fullPath);
	console.debug('loadRoutes', { rootPath, routeName, fullPath, contents });

	await Promise.all(contents.map(async (fileName) => {
		const filePath = path.join(fullPath, fileName);
		console.debug({ filePath, fileName });
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
	console.debug('loadComponents', { rootPath, componentName, fullPath, contents });


	await Promise.all(contents.map(async (fileName) => {
		const filePath = path.join(fullPath, fileName);
		console.debug({ filePath, fileName });
		if (await directoryExists(filePath)) {
			Object.assign(components, await loadComponents(rootPath, [...heirarchy, fileName]));
		} else if (/\.(html|js)$/.test(fileName)) {
			const baseFilePath = filePath.replace(/\.(html|js)$/, '');

			const fileBaseName = fileName.replace(/\.(html|js)$/, '');

			const name = componentName.replace(/^\//, '').replace(/\W+/g, '-').toLowerCase();

			const templatePath = `${baseFilePath}.html`;
			const templateFile = path.join(componentPath, `${fileBaseName}.html`);

			const controllerPath = `${baseFilePath}.html`;
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

async function check(context, filePath, fileName) {
	console.debug({ filePath, fileName, cwd: process.cwd() });
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
		if(shouldCopy) {
			await fs.mkdir(path.dirname(dest), { recursive: true });
			await fs.copyFile(src, dest);
		}
	}
};

(async () => {
	const args = Array.from(process.argv).slice(2);

	const projectDirectory = await findProjectDirectory(args);
	console.debug({ projectDirectory });

	const projectConfig = await loadProjectConfig();
	console.debug({ projectConfig });

	const {
		projectRoutesPath,
		projectRootPath,
		projectComponentsPath,
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

	await copyEngine({
		projectBuildPath,
	});

	// import/run host
	require('./src/client-server');

	console.debug('failed to explode');
})();

async function findProjectDirectory(args) {
	if (!args.length) {
		console.error('Project directory required.');
		process.exit();
	}

	const promises = args.map(async (filepath) =>
		await fileExists(path.join(filepath, 'stupid-ui.json')) ? filepath : null
	);
	const directories = (await Promise.all(promises)).filter(Boolean);
	console.debug({ directories });
	if (!directories.length) {
		console.error('Project directory required.');
		process.exit();
	} else if (directories.length > 1) {
		console.error('Too many candidate directories.');
		process.exit();
	}
	const projectDirectory = directories[0];
	if (!(await directoryExists(projectDirectory))) {
		console.error('Directory not found:', projectDirectory);
		process.exit();
	}
	process.chdir(projectDirectory);
	return projectDirectory;
}

async function loadProjectConfig() {
	const projectFile = 'stupid-ui.json';
	const fileContents = await fs.readFile(projectFile);
	console.debug({ fileContents: fileContents.toString() });
	const projectConfig = await noThrow(() => JSON.parse(fileContents));
	if (!projectConfig) {
		console.error('Project file should be valid JSON.');
		process.exit();
	} else if (!projectConfig.root) {
		console.error('Project file should indicate a client directory on `.root`.');
		process.exit();
	}
	return projectConfig;
}

async function loadProjectPaths(projectConfig) {
	const unsafeProjectRootOption = projectConfig.root;
	const projectRootPath = `${path.normalize(unsafeProjectRootOption)}/`
		.replace(/^(\.\.\/)+/g, '')
		.replace(/^\/+|\/+$/g, '') || '.';
	const projectRoutesPath = path.join(projectRootPath, 'routes');
	const projectComponentsPath = path.join(projectRootPath, 'components');
	console.debug({ projectRootPath, projectRoutesPath, projectComponentsPath });

	if (!(await directoryExists(projectRootPath))) {
		console.error('Not valid entry point:', projectRootPath);
		process.exit();
	}
	if (!(await directoryExists(projectRoutesPath))) {
		console.error('No routes:', projectRoutesPath);
		process.exit();
	}
	if (!(await fileExists(path.join(projectRoutesPath, 'root.html')))) {
		console.error('No root view:', projectRoutesPath);
		process.exit();
	}

	const projectBuildPath = 'build';
	console.debug({ cwd: process.cwd(), projectBuildPath });
	if (await directoryExists(projectBuildPath)) {
		await fs.rmdir(projectBuildPath, { recursive: true });
	}
	fs.mkdir(projectBuildPath, { recursive: true });

	return {
		projectRoutesPath,
		projectRootPath,
		projectComponentsPath,
		projectBuildPath,
	};
}

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

async function copyEngine({
	projectBuildPath,
}) {
	await copyFiles(
		path.join(__dirname, 'src', 'engine'),
		path.join(projectBuildPath, 'engine'),
	);
}
