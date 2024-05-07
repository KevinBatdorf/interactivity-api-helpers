import { readdir, writeFile, readFile } from 'fs/promises';
import micromatch from 'micromatch';
import { dirname, resolve, relative, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blueprintFilePath = resolve(__dirname, 'blueprint.json');
const blockDir = __dirname;

const ignoreList = ['blueprint*', '*.js.map', '*.d.ts'];
const destination = '/wordpress/wp-content/plugins/iapih/';
const startingStepsState = [
	{
		step: 'mkdir',
		path: '/wordpress/wp-content/plugins/iapih/',
	},
	{
		step: 'activatePlugin',
		pluginName: 'iapih',
		pluginPath: '/wordpress/wp-content/plugins/iapih/',
	},
];
const insertWritesAfter = 0;

async function readBlueprint(jsonFilePath) {
	const fileContent = await readFile(jsonFilePath, 'utf8');
	return JSON.parse(fileContent);
}

async function writeBlueprint(blueprint, jsonFilePath) {
	const jsonContent = JSON.stringify(blueprint, null, '\t');
	await writeFile(jsonFilePath, jsonContent + '\n');
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

async function getDirsInDirectory(dirPath) {
	const entries = await readdir(dirPath, { withFileTypes: true });
	const dirs = entries
		.filter((file) => file.isDirectory())
		.map((dir) => resolve(dirPath, dir.name));

	const subdirs = await Promise.all(dirs.map((dir) => getDirsInDirectory(dir)));
	return Array.prototype.concat(dirs, ...subdirs);
}

async function processWrites() {
	const blueprint = await readBlueprint(blueprintFilePath);

	const allFiles = await getFilesInDirectory(blockDir);
	const filesContentPromises = allFiles.map(async (filePath) => {
		const content = await readFile(filePath, 'utf8');
		const relativePath = relative(blockDir, filePath);
		const pluginPath = join(destination, relativePath);
		return {
			step: 'writeFile',
			path: pluginPath,
			data: content,
		};
	});

	const filesData = await Promise.all(filesContentPromises);
	blueprint.steps.splice(insertWritesAfter + 1, 0, ...filesData);

	// Then process dirs to mk (they prepend before files)
	const allDirs = await getDirsInDirectory(blockDir);
	const mkdirPromises = allDirs.map((dirPath) => {
		const relativePath = relative(blockDir, dirPath);
		const pluginPath = join(destination, relativePath);
		return {
			step: 'mkdir',
			path: pluginPath,
		};
	});

	const mkdirs = await Promise.all(mkdirPromises);
	blueprint.steps.splice(insertWritesAfter + 1, 0, ...mkdirs);

	await writeBlueprint(blueprint, blueprintFilePath);
}

// Add the demo content to the blueprint, which later is inserted on the homepage
async function processDemoContent() {
	const blueprint = await readBlueprint(blueprintFilePath);

	const allDemoFiles = await getFilesInDirectory(join(blockDir, '../src'));
	const demoFilePromises = allDemoFiles
		.filter((filePath) => filePath.endsWith('.demo.ts'))
		.map(async (filePath) => {
			const content = await readFile(filePath, 'utf8');
			const htmlExportMatch = content.match(/export const html = `(.*?)`;/s);
			if (htmlExportMatch) {
				const phpCode = `<?php
require '/wordpress/wp-load.php';
$id = wp_insert_post([
		'post_title' => 'Test Page',
		'post_content' => '${htmlExportMatch[1]}',
		'post_status' => 'publish',
		'post_author' => 1
]);
update_option('page_on_front', $id);
update_option('show_on_front', 'page');`;

				return {
					step: 'runPHP',
					code: phpCode,
				};
			}
		});

	const demoFileExports = await Promise.all(demoFilePromises);
	const validDemoFileExports = demoFileExports.filter(
		(exportStep) => exportStep,
	);

	blueprint.steps.push(...validDemoFileExports);

	await writeBlueprint(blueprint, blueprintFilePath);
}

async function main() {
	let blueprint = await readBlueprint(blueprintFilePath);
	// Remove all the previously generated steps
	blueprint.steps = startingStepsState;
	// Write the cleaned blueprint back
	await writeBlueprint(blueprint, blueprintFilePath);

	// Collect all the files and add the content to the blueprint
	await processWrites();
	// Add the demo content to the blueprint, which later is inserted on the homepage
	await processDemoContent();
}

main().catch(console.error);
