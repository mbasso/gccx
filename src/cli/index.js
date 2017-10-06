#!/usr/bin/env
import program from 'commander';
import compile from './compiler';
import getConfig from './config';
import { exit } from './utils';
import { version } from '../../package.json';

let input;

program
  .version(version)
  .arguments('<file_or_directory>')
  .option('-o, --output <directory>', 'Destination folder for compiled files')
  .option('-x, --extensions <extensions>', 'List of extensions to hook into', val => val.split(',').map(String))
  .option('-i, --ignore <regex>', 'Ignore all files and directories that match this regex')
  .option('--no-gccxrc', 'Whether or not to look up .gccxrc')
  .option('--no-copy-files', 'When compiling a directory avoid copy over non-compilable files')
  // TODO : .option('-w, --watch', 'Compile files every time that you change them')
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

// eslint-disable-next-line
console.log('\n');

compile(config.input, config.output, config);
