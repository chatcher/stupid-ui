const fs = require('fs/promises');
const path = require('path');
const util = require('util');

const noThrow = async (method) => { try { return await method() } catch (_) {} };

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

	const routePath = path.join('/', ...heirarchy);
	const fullPath = path.join(rootPath, routePath);
	const contents = await fs.readdir(fullPath);
	console.debug('loadRoutes', { rootPath, routePath, fullPath, contents });

	await Promise.all(contents.map(async (fileName) => {
		const filePath = path.join(fullPath, fileName);
		console.debug({ filePath, fileName });
		if (await directoryExists(filePath)) {
			Object.assign(routes, await loadRoutes(rootPath, [...heirarchy, fileName]));
		} else if (/\.html$/.test(fileName)) {
			const routeName = routePath.replace(/^\//, '');
			routes[routePath] = {
				file: path.join('/routes', routePath, fileName),
				path: routePath,
				name: `${(routeName || 'root').replace(/\W/g, '-').toLowerCase()}-view`,
			};
		}
	}));

	return routes;
};

const copyFiles = async (src, dest, filter = () => true) => {
	console.debug('copyFiles', { src, dest });
	if (await directoryExists(src)) {
		const contents = await fs.readdir(src);
		console.debug({ contents });
		await Promise.all(contents.map((fileName) =>
			// const filePath =
			copyFiles(
				path.join(src, fileName),
				path.join(dest, fileName),
				filter,
			)
			// console.debug({ filePath, fileName });
			// copyFiles(filepath)
		));
	} else if (await fileExists(src)) {
		const shouldCopy = filter(src);
		console.debug({ shouldCopy, src });
		if(shouldCopy) {
			await fs.mkdir(path.dirname(dest), { recursive: true });
			await fs.copyFile(src, dest);
		}
	}
};

(async () => {
	const args = Array.from(process.argv).slice(2);

	if (!args.length) {
		console.error('Project directory required.');
		process.exit();
	}

	const projectDirectory = await (async (args) => {
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
		return directories[0];
	})(args);
	console.debug({ projectDirectory });
	if (!(await directoryExists(projectDirectory))) {
		console.error('Directory not found:', projectDirectory);
		process.exit();
	}
	process.chdir(projectDirectory);

	const projectConfig = await (async () => {
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
	})();
	console.debug({ projectConfig });

	const unsafeProjectRootOption = projectConfig.root;
	const projectRootPath = `${path.normalize(unsafeProjectRootOption)}/`
		.replace(/^(\.\.\/)+/g, '')
		.replace(/^\/+|\/+$/g, '') || '.';
	console.debug({ projectRootPath });

	if (!(await directoryExists(projectRootPath))) {
		console.error('Not valid entry point:', projectRootPath);
		process.exit();
	}

	const projectRoutesPath = path.join(projectRootPath, 'routes');
	console.debug({ projectRoutesPath });

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

	// load routes
	const routes = await loadRoutes(projectRoutesPath);
	console.debug({ routes });

	// copy route files
	await fs.writeFile(
		path.join(projectBuildPath, 'routes.js'),
		`export const routes = ${JSON.stringify(routes, null, 2)};\n`,
	);
	await copyFiles(
		projectRoutesPath,
		path.join(projectBuildPath, 'routes'),
		(filePath) => {
			const routeFile = filePath.replace(projectRoutesPath, '');
			const route = Object.values(routes)
				.find((route) => routeFile === route.file);

			console.debug('filter', { filePath, routeFile, route });
			return route;
		}
	);

	// copy engine files
	await copyFiles(
		path.join(__dirname, 'src', 'engine'),
		path.join(projectBuildPath, 'engine'),
	);

	// import/run host





	console.log('failed to explode');

})();
