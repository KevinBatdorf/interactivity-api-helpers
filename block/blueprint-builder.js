import { readdir, writeFile, readFile } from 'fs/promises';
import micromatch from 'micromatch';
import { dirname, resolve, relative, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ignoreList = ['blueprint*', '*.js.map', '*.d.ts'];
const destination = '/wordpress/wp-content/plugins/iapih';
const insertAfter = `{
	"step": "mkdir",
	"path": "/wordpress/wp-content/plugins/iapih"
}`;

async function readBlueprint(jsonFilePath) {
	const fileContent = await readFile(jsonFilePath, 'utf8');
	return JSON.parse(fileContent);
}

async function writeBlueprint(blueprint, jsonFilePath) {
	const jsonContent = JSON.stringify(blueprint, null, 2);
	await writeFile(jsonFilePath, jsonContent);
}

async function getFilesInDirectory(dirPath) {
	const entries = await readdir(dirPath, { withFileTypes: true });

	const files = entries
		.filter((entry) => !micromatch.isMatch(entry.name, ignoreList))
		.map((entry) => {
			const res = resolve(dirPath, entry.name);
			return entry.isDirectory() ? getFilesInDirectory(res) : res;
		});

	const filesList = await Promise.all(files);
	return Array.prototype.concat(...filesList);
}

async function run(blueprintFilePath, dirPath) {
	const blueprint = await readBlueprint(blueprintFilePath);
	const mkdirIndex = blueprint.steps.findIndex(
		(step) => JSON.stringify(step) === JSON.stringify(JSON.parse(insertAfter)),
	);

	blueprint.steps = blueprint.steps.filter((step) => step.step !== 'writeFile');

	const allFiles = await getFilesInDirectory(dirPath);
	const filesContentPromises = allFiles.map(async (filePath) => {
		const content = await readFile(filePath, 'utf8');
		const relativePath = relative(dirPath, filePath);
		const pluginPath = join(destination, relativePath);
		return {
			step: 'writeFile',
			path: pluginPath,
			data: content,
		};
	});

	const filesData = await Promise.all(filesContentPromises);
	blueprint.steps.splice(mkdirIndex + 1, 0, ...filesData);

	await writeBlueprint(blueprint, blueprintFilePath);
}

run(resolve(__dirname, 'blueprint.json'), __dirname).catch((err) =>
	console.error(err),
);
