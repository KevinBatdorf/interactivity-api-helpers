import fs from 'fs/promises';
import path from 'path';

async function getFilesInDirectory(dirPath) {
	const entries = await fs.readdir(dirPath, { withFileTypes: true });

	const files = entries.map((entry) => {
		const res = path.resolve(dirPath, entry.name);
		return entry.isDirectory() ? getFilesInDirectory(res) : res;
	});

	const filesList = await Promise.all(files);
	return Array.prototype.concat(...filesList);
}

async function readBlueprint(jsonFilePath) {
	const fileContent = await fs.readFile(jsonFilePath, 'utf8');
	return JSON.parse(fileContent);
}

async function writeBlueprint(blueprint, jsonFilePath) {
	const jsonContent = JSON.stringify(blueprint, null, 2);
	await fs.writeFile(jsonFilePath, jsonContent);
}

async function executeModifyBlueprintTask(blueprintFilePath, dirPath) {
	const blueprint = await readBlueprint(blueprintFilePath);
	blueprint.steps = blueprint.steps.filter((step) => step.step !== 'writeFile');

	const allFiles = await getFilesInDirectory(dirPath);
	const filesContentPromises = allFiles.map(async (filePath) => {
		const content = await fs.readFile(filePath, 'utf8');
		return {
			path: filePath,
			content,
		};
	});

	const filesData = await Promise.all(filesContentPromises);
	filesData.forEach((fileInfo) => {
		const { path, content } = fileInfo;
		blueprint.steps.push({
			step: 'writeFile',
			path,
			data: content,
		});
	});

	await writeBlueprint(blueprint, blueprintFilePath);
}

executeModifyBlueprintTask('./blueprint.json', '.').catch((err) =>
	console.error(err),
);
