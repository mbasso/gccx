import fs from 'fs';
import path from 'path';
import { version } from '../../package.json';
import { execCli } from './utils';

describe('cli', () => {
  beforeAll(() => {
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
  });

  test('shold output help if input is not provided', (done) => {
    execCli([], (err, stdout) => {
      expect(/^\s*Usage:/.test(stdout)).toBeTruthy();
      done();
    });
  });

  test('shold exit with code 1 if input is not provided', (done) => {
    execCli([], (err) => {
      expect(err).toBeDefined();
      expect(err.message).toEqual('1');
      done();
    });
  });

  ['-V', '--version'].forEach((command) => {
    test(`shold output version with ${command}`, (done) => {
      execCli([command], (err, stdout) => {
        const versionRegex = new RegExp(`^\s*${version}`);
        expect(versionRegex.test(stdout)).toBeTruthy();
        done();
      });
    });
  });

  ['-h', '--help'].forEach((command) => {
    test(`shold output help with ${command}`, (done) => {
      execCli([command], (err, stdout) => {
        expect(/^\s*Usage:/.test(stdout)).toBeTruthy();
        done();
      });
    });
  });

  test('should compile file and print code if output is not provided', (done) => {
    execCli(['files/span.cpp'], (err, stdout) => {
      expect(stdout.trim()).toEqual('asmdom::h(u8"span")');
      done();
    });
  });

  test('should compile file and write output in file', (done) => {
    const output = path.join(__dirname, '../../temp/span.cpp');
    execCli(['files/span.cpp', '-o', output], (err, stdout) => {
      expect(fs.readFileSync(output, 'utf8')).toEqual('asmdom::h(u8"span")');
      expect(stdout.trim()).toEqual(`files/span.cpp -> ${output}`);
      done();
    });
  });
});
