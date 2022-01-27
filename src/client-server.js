const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const noThrow = async (method) => {
	try {
		return await method();
	} catch (error) {
		// console.error(error)
	}
};

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

const app = express();
const port = 3000;

console.debug('client-server', { cwd: process.cwd() });

app.use(express.static('build'))

app.get('*', async (req, res) => {
	const url = req.url;

console.debug({ url, cwd: process.cwd() });

	if (await directoryExists(`build/routes/${url}`)) {
		console.debug('exists')
	}

	res.sendFile('build/engine/index.html', {
		root: process.cwd(),
	});
});

app.listen(port, () => {
	console.info('Client server listening on port', port);
});
