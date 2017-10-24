#!/usr/bin/env node
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
  .option('-o, --output <file_or_directory>', 'destination file or folder for compiled files')
  .option('-x, --extensions <extensions>', 'list of extensions to hook into', val =>
    val.split(',').map(x => String(x).replace(/(?:(^")|("$))/g, '')))
  .option('-i, --ignore <regex>', 'ignore all files and directories that match this regex')
  .option('--no-gccxrc', 'whether or not to look up .gccxrc')
  .option('--no-copy-files', 'when compiling a directory avoid copy over non-compilable files')
  .option('-w, --watch', 'compile files every time that you change them')
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

const compileFirst = () => compile(config.input, config.output, config, true);

if (config.watch) {
  const getOutputPath = (inputPath) => {
    let result;
    if (config.output) {
      const relative =
        config.input !== inputPath ? path.relative(config.input, inputPath) : inputPath;
      result = path.resolve(config.output, relative);
      if (result === relative) {
        result = config.output;
      }
    }
    return result;
  };

  const onCompilationError = (file, ex) => {
    if (ex !== undefined && ex !== null) {
      // eslint-disable-next-line
      console.error(`\nError in file: ${file}\n\n${ex.message || ex}\n`);
    }
  };

  compileFirst().catch(onCompilationError.bind(null, config.input));

  const compilePath = (changed) => {
    compile(changed, getOutputPath(changed), config).catch(onCompilationError.bind(null, changed));
  };

  chokidar
    .watch(config.input, {
      persistent: true,
      ignoreInitial: true,
    })
    .on('change', compilePath)
    .on('add', compilePath)
    .on('addDir', (created) => {
      const output = getOutputPath(created);
      if (!fs.existsSync(output)) {
        fs.mkdirSync(output);
      }
    })
    .on('error', error =>
      exit({
        code: 1,
        message: error,
      }));
} else {
  compileFirst().catch((ex) => {
    exit({
      code: 1,
      message: ex && ex.message ? ex.message : ex,
    });
  });
}
