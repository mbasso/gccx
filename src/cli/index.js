#!/usr/bin/env
import fs from 'fs';
import path from 'path';
import program from 'commander';
import chokidar from 'chokidar';
import compile from './compiler';
import getConfig from './config';
import { exit } from './utils';
import { version } from '../../package.json';

let input;

program
  .version(version)
  .arguments('<file_or_directory>')
  .option('-o, --output <directory>', 'Destination folder for compiled files')
  .option(
    '-x, --extensions <extensions>', 'List of extensions to hook into',
    val => val.split(',').map(x => String(x).replace(/(?:(^")|("$))/g, '')),
  )
  .option('-i, --ignore <regex>', 'Ignore all files and directories that match this regex')
  .option('--no-gccxrc', 'Whether or not to look up .gccxrc')
  .option('--no-copy-files', 'When compiling a directory avoid copy over non-compilable files')
  .option('-w, --watch', 'Compile files every time that you change them')
  .action((fileOrDirectory) => {
    input = fileOrDirectory;
  })
  .parse(process.argv);

if (input === undefined) {
  program.outputHelp();
  exit({
    code: 1,
  });
}

const config = getConfig(input, program);

if (config.watch) {
  const getOutputPath = (inputPath) => {
    let result;
    if (config.output) {
      const relative = config.input !== inputPath
        ? path.relative(config.input, inputPath)
        : inputPath;
      result = path.resolve(
        config.output,
        relative,
      );
      if (result === relative) {
        result = config.output;
      }
    }
    return result;
  };

  const compilePath = (changed) => {
    compile(changed, getOutputPath(changed), config);
  };

  chokidar.watch(config.input, {
    persistent: true,
  })
    .on('change', compilePath)
    .on('add', compilePath)
    .on('addDir', (created) => {
      const output = getOutputPath(created);
      if (!fs.existsSync(output)) {
        fs.mkdirSync(output);
      }
    })
    .on('error', error => exit({
      code: 1,
      message: error,
    }));
}

// eslint-disable-next-line
console.log('\n');

compile(config.input, config.output, config, true);
