import fs from 'fs';
import path from 'path';

const defaultConfig = {
  output: undefined,
  extensions: ['.cpx', '.CPX', '.C', '.cc', '.cpp', '.CPP', '.c++', '.cp', '.cxx'],
  ignore: undefined,
  gccxrc: true,
  copyFiles: true,
  watch: false,
};

const mergeConfig = (config1, config2) => {
  const config = {};
  Object.keys(defaultConfig).forEach((key) => {
    if (config2[key] !== undefined) {
      config[key] = config2[key];
    }
  });
  return Object.assign({}, config1, config);
};

export default function buildConfig(input, program = {}) {
  if (typeof input !== 'string') {
    throw new TypeError(`input has to be a string, got: ${typeof input}`);
  } else if (input === '') {
    throw new Error('input cannot be empty');
  } else if (!fs.existsSync(input)) {
    throw new Error('input is not a file or a directory');
  }

  let config = {
    input,
    ...defaultConfig,
  };

  const gccxrcPath = path.join(process.cwd(), '.gccxrc');
  if ((program.gccxrc || program.gccxrc === undefined) && fs.existsSync(gccxrcPath)) {
    const gccxrcConfigs = JSON.parse(fs.readFileSync(gccxrcPath, 'utf8'));
    config = mergeConfig(config, gccxrcConfigs);
  }

  config = mergeConfig(config, program);

  config.extensions.forEach((ext) => {
    if (!/^\.[a-zA-Z_][a-zA-Z0-9_]*/.test(ext)) {
      throw new Error(`extension "${ext}" does not match the extension format`);
    }
  });

  const inputIsDirectory = fs.lstatSync(input).isDirectory();
  if (inputIsDirectory && !config.output) {
    throw new Error('invalid config: cannot use input directory without output option');
  } else if (inputIsDirectory && /(\.\w+)+/.test(config.output)) {
    throw new Error('invalid config: output is a file and input is a directory');
  }

  return config;
}
