const express = require('express');
const fs = require('fs/promises');
const path = require('path');

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

const app = express();
const port = 3000;

console.debug('client-server', { cwd: process.cwd() });

app.use(express.static('build'));

app.get('*', async (req, res) => {
	const { url } = req;

	const routeFilePath = path.join('build/routes', url);
	console.debug({ url, cwd: process.cwd(), routeFilePath });

	// if (await directoryExists(routeFilePath)) {
	// 	console.debug('route dir exists', { url })
	// }

	if (await fileExists(routeFilePath)) {
		console.debug('route file exists', { url });
	}

	return res.sendFile('build/engine/index.html', {
		root: process.cwd(),
	});
});

app.listen(port, () => {
	console.info('Client server listening on port', port);
});
