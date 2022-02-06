const path = require('path');
const { fileExists, directoryExists } = require('./utilities');

module.exports.findProjectDirectory = async (args) => {
	if (!args.length) {
		console.error('Project directory required.');
		process.exit();
	}

	const promises = args.map(async (filepath) =>
		await fileExists(path.join(filepath, 'stupid-ui.json')) ? filepath : null
	);
	const directories = (await Promise.all(promises)).filter(Boolean);

	if (!directories.length) {
		console.error('Project directory required.');
		console.log({
			cwd: process.cwd(),
			args,
		});
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
};
