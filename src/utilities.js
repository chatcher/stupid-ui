const fs = require('fs/promises');
const path = require('path');

module.exports.noThrow = async (method) => {
	try {
		return await method();
	} catch (_) {}
};

module.exports.fileExists = (filepath) => {
	return this.noThrow(async () => {
		return (await fs.stat(filepath)).isFile();
	});
};

module.exports.directoryExists = (filepath) => {
	return this.noThrow(async () => {
		return (await fs.stat(filepath)).isDirectory();
	});
};

module.exports.copyFiles = async (src, dest, filter = () => true) => {
	// console.debug('copyFiles', { src, dest });
	if (await this.directoryExists(src)) {
		const contents = await fs.readdir(src);
		// console.debug({ contents });
		await Promise.all(contents.map((fileName) =>
			this.copyFiles(
				path.join(src, fileName),
				path.join(dest, fileName),
				filter,
			)
		));
	} else if (await this.fileExists(src)) {
		const shouldCopy = filter(src);
		// console.debug({ shouldCopy, src });
		if (shouldCopy) {
			await fs.mkdir(path.dirname(dest), { recursive: true });
			await fs.copyFile(src, dest);
		}
	}
};

module.exports.check = async (context, filePath, fileName) => {
	// console.debug({ filePath, fileName, cwd: process.cwd() });
	if (await this.fileExists(filePath)) {
		context.files.push(fileName);
		return fileName;
	}
	return null;
};
