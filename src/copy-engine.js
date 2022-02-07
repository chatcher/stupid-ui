const path = require('path');
const { copyFiles } = require('./utilities');

module.exports.copyEngine = async ({
	projectBuildPath,
}) => {
	await copyFiles(
		path.join(__dirname, '..', 'engine'),
		path.join(projectBuildPath, 'engine'),
	);
};
