const fs = require('fs/promises');
const { noThrow } = require('./utilities');

module.exports.loadProjectConfig = async () => {
	const projectFile = 'stupid-ui.json';
	const fileContents = await fs.readFile(projectFile);
	const projectConfig = await noThrow(() => JSON.parse(fileContents));

	if (!projectConfig) {
		console.error('Project file should be valid JSON.');
		process.exit();
	} else if (!projectConfig.root) {
		console.error('Project file should indicate a client directory on `.root`.');
		process.exit();
	}

	return projectConfig;
};
