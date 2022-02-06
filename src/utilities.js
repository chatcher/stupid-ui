const fs = require('fs/promises');

const noThrow = async (method) => {
	try {
		return await method();
	} catch (_) {}
};
module.exports.noThrow = noThrow;

module.exports.fileExists = (filepath) => {
	return noThrow(async () => {
		return (await fs.stat(filepath)).isFile();
	});
};

module.exports.directoryExists = (filepath) => {
	return noThrow(async () => {
		return (await fs.stat(filepath)).isDirectory();
	});
};
