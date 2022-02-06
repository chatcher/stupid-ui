const fs = require('fs/promises');
const path = require('path');
const { fileExists, directoryExists } = require('./utilities');

module.exports.loadProjectPaths = async (projectConfig) => {
	const unsafeProjectRootOption = projectConfig.root;
	const projectRootPath = `${path.normalize(unsafeProjectRootOption)}/`
		.replace(/^(\.\.\/)+/g, '')
		.replace(/^\/+|\/+$/g, '') || '.';
	const projectRoutesPath = path.join(projectRootPath, 'routes');
	const projectComponentsPath = path.join(projectRootPath, 'components');
	const projectServicesPath = path.join(projectRootPath, 'services');
	const projectBuildPath = 'build';
	console.debug({
		cwd: process.cwd(),
		projectRootPath,
		projectRoutesPath,
		projectComponentsPath,
		projectServicesPath,
		projectBuildPath,
	});

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

	if (await directoryExists(projectBuildPath)) {
		await fs.rmdir(projectBuildPath, { recursive: true });
	}

	fs.mkdir(projectBuildPath, { recursive: true });

	return {
		projectRoutesPath,
		projectRootPath,
		projectComponentsPath,
		projectServicesPath,
		projectBuildPath,
	};
};
