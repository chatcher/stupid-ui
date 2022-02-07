const { changeToProjectDirectory } = require('./src/find-project-directory');
const { loadProjectConfig } = require('./src/load-project-config');
const { loadProjectPaths } = require('./src/load-project-paths');
const { copyRoutes } = require('./src/copy-routes');
const { copyComponents } = require('./src/copy-components');
const { copyServices } = require('./src/copy-services');
const { copyEngine } = require('./src/copy-engine');

(async () => {
	const args = Array.from(process.argv).slice(2);

	await changeToProjectDirectory(args);

	const projectConfig = await loadProjectConfig();

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
	require('./src/client-server');

	console.debug('failed to explode');
})();
