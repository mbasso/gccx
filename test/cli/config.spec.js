import buildConfig from '../../src/cli/config';

describe('config', () => {
  const processCwd = process.cwd;

  afterEach(() => {
    process.cwd = processCwd;
  });

  test('should throw if input is not a string', () => {
    expect(
      () => buildConfig(),
    ).toThrowError('input has to be a string, got: undefined');
  });

  test('should throw if input an empty input is provided', () => {
    expect(
      () => buildConfig(''),
    ).toThrowError('input cannot be empty');
  });

  test('should throw if input is not a file or a directory', () => {
    expect(
      () => buildConfig('exampleFile'),
    ).toThrowError('input is not a file or a directory');
  });

  test('should throw if output is a file and input is a directory', () => {
    expect(
      () => buildConfig('src', {
        output: 'file.cpp',
      }),
    ).toThrowError('invalid config: output is a file and input is a directory');
  });

  test('should throw if output is undefined and input is a directory', () => {
    expect(
      () => buildConfig('src'),
    ).toThrowError('invalid config: cannot use input directory without output option');
  });

  test('should throw if extensions are not well formatted', () => {
    expect(
      () => buildConfig('package.json', {
        extensions: ['cpp'],
      }),
    ).toThrowError('extension "cpp" does not match the extension format');
  });

  test('should support extensions format', () => {
    expect(
      () => buildConfig('package.json', {
        extensions: ['.cpp', '.spec.js'],
      }),
    ).not.toThrow();
  });

  test('should get default config if no command line options and no gccxrc are provided', () => {
    const config = buildConfig('package.json');
    expect(config).toEqual({
      input: 'package.json',
      output: undefined,
      extensions: ['.cpx', '.CPX', '.C', '.cc', '.cpp', '.CPP', '.c++', '.cp', '.cxx'],
      ignore: undefined,
      gccxrc: true,
      copyFiles: true,
      watch: false,
    });
  });

  test('should get config from command line', () => {
    const config = buildConfig('package.json', {
      gccxrc: false,
    });
    expect(config.gccxrc).toEqual(false);
  });

  test('should get config from gccxrc', () => {
    process.cwd = () => __dirname;
    const config = buildConfig('package.json');
    expect(config.extensions).toEqual(['.cpp']);
    expect(config.ignore).toEqual('foo');
  });

  test('should overwrite gccxrc config from command line', () => {
    process.cwd = () => __dirname;
    const config = buildConfig('package.json', {
      ignore: 'bar',
    });
    expect(config.extensions).toEqual(['.cpp']);
    expect(config.ignore).toEqual('bar');
  });
});
