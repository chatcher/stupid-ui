const fs = require('fs');
const util = require('util');

const stat = util.promisify(fs.stat);
const readFile = util.promisify(fs.readFile);

const noThrow = async (method) => { try { return await method() } catch (_) {console.error(_)} };

const fileExists = async (filepath) => {
	return await noThrow(async () => {
		return (await stat(filepath)).isFile();
	});
};

const directoryExists = async (filepath) => {
	return await noThrow(async () => {
		return (await stat(filepath)).isDirectory();
	});
};

(async () => {
	const args = Array.from(process.argv).slice(2);

	if (!args.length) {
		console.error('Project directory required.');
		process.exit();
	}
	console.debug(args)

	const promises = args.map(async (filepath) =>
		await fileExists(`${filepath}/stupid-ui.json`) ? filepath : null
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
	const projectFile = `${projectDirectory}/stupid-ui.json`
	const fileContents = await readFile(projectFile);
	console.debug({ fileContents: fileContents.toString() });
	const projectConfig = await noThrow(() => JSON.parse(fileContents));
	console.debug({ projectConfig });
	if (!projectConfig) {
		console.error('Project file should be valid JSON.');
		process.exit();
	} else if (!projectConfig.root) {
		console.error('Project file should indicate a default View on `.root`.');
		process.exit();
	}

	const rootViewOption = projectConfig.root;
	const rootViewPath = `${projectDirectory}/${rootViewOption}`;
	console.debug({ rootViewPath });

	if (!(await directoryExists(rootViewPath))) {
		console.error('Not valid entry point:', rootViewPath);
		process.exit();
	}

	const rootViewName = rootViewPath.replace(/.*\//, '');
	console.debug({ rootViewName });
	const rootViewFileJs = `${rootViewPath}/${rootViewName}.js`;
	const rootViewFileTs = `${rootViewPath}/${rootViewName}.ts`;

	let rootViewFile = null;
	let tranpiler = null;
	if (await fileExists(rootViewFileJs)) {
		rootViewFile = rootViewFileJs;
		transpiler = 'js';
	} else if (await fileExists(rootViewFileTs)) {
		rootViewFile = rootViewFileTs;
		transpiler = 'ts';
	}

	console.debug({ rootViewFile, transpiler });

	if (!rootViewFile) {
		console.error('View controller file not found where expected');
		process.exit();
	}

	const rootView = require(rootViewFile);
	console.log({ rootView });

	console.log('failed to explode');

})();
