#!/usr/bin/env node
'use strict';
const fs = require('fs');
const meow = require('meow');
const postcss = require('postcss');
const tailwindcss = require('tailwindcss');
const build = require('./build');
const yargs = require('yargs');

const {config, output} = yargs
	.option('config', {
		alias: 'c',
		type: 'string',
		description: 'path to config file'
	})
	.option('output', {
		alias: 'o',
		type: 'string',
		description: 'path to output file',
		default: 'styles.json'
	}).argv;

meow(`
	Usage
	  $ create-tailwind-rn
`);

const source = `
@tailwind base;
@tailwind components;
@tailwind utilities;
`;

postcss([config ? tailwindcss({config}) : tailwindcss])
	.process(source, {from: undefined})
	.then(({css}) => {
		const styles = build(css);
		fs.writeFileSync(output, JSON.stringify(styles, null, '\t'));
	})
	.catch(error => {
		console.error('> Error occurred while generating styles');
		console.error(error.stack);
		process.exit(1);
	});
