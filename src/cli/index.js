#!/usr/bin/env node
import program from 'commander';
import { version } from '../../package.json';
import { exit } from './utils';

let input;

program
  .version(version)
  .arguments('<file_or_directory>')
  .option('-o, --output <directory>', 'Destination folder for compiled files')
  .option('-e, --extensions <extensions>', 'List of extensions to hook into')
  .option('-E, --exclude <directories>', 'List of directories and files to avoid at compile time')
  .option('-ng, --no-gccxrc', 'Whether or not to look up .gccxrc')
  .option('-nc, --no-copy-files', 'When compiling a directory avoid copy over non-compilable files')
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
