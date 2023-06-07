const fs = require("fs");
const path = require("path");
const foundryPath = require("./foundry-path.js");
import copy from "rollup-plugin-copy";
import watch from "rollup-plugin-watch";
import scss from "rollup-plugin-scss";

import jscc from "rollup-plugin-jscc";

let manifest = JSON.parse(fs.readFileSync("./system.json"));

let systemPath = foundryPath.systemPath(manifest.id);

console.log(`Bundling to ${systemPath}`);
export default {
	input: [`${manifest.id}.js`],
	output: {
		file: path.join(systemPath, `${manifest.id}.js`),
	},
	watch: {
		clearScreen: true,
	},
	plugins: [
		jscc({
			values: {_ENV: process.env.NODE_ENV},
		}),
		scss({fileName: "css/wfrp4e-skins.css"}),
		copy({
			targets: [
				{src: "./template.json", dest: systemPath},
				{src: "./system.json", dest: systemPath},
				{src: "./WFRP-Header.jpg", dest: systemPath},
				{src: "./static/*", dest: systemPath},
			],
		}),
		process.env.NODE_ENV === "production"
			? null
			// FIXME this does not track *new* files, only changes/deletions to existing files
			: watch({
				dir: process.cwd(),
				include: [
					/static(\/.*)?/,
					"system.json",
					"template.json",
				],
			}),
	].filter(Boolean),
	onwarn (warning, warn) {
		// suppress eval warnings
		if (warning.code === "EVAL") return;
		warn(warning);
	},
};
