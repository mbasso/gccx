#!/usr/bin/env node
import program from 'commander';
import { version } from '../../package.json';
import { exit } from './utils';

let input;

program
  .version(version)
  .arguments('<file_or_directory>')
  .option('-o, --output <directory>', 'Destination folder for compiled files')
  .option('-x, --extensions <extensions>', 'List of extensions to hook into')
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
