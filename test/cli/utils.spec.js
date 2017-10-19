import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { exit, copy } from '../../src/cli/utils';

describe('utils', () => {
  describe('exit', () => {
    let originalExit;

    beforeAll(() => {
      originalExit = process.exit;
      process.exit = () => {};
    });

    afterAll(() => {
      process.exit = originalExit;
    });

    test('should exit with code 0 and without message by default', () => {
      const logSpy = jest.spyOn(console, 'log');
      const exitSpy = jest.spyOn(process, 'exit');
      exit();
      expect(logSpy).not.toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(0);
      logSpy.mockReset();
      logSpy.mockRestore();
      exitSpy.mockReset();
      exitSpy.mockRestore();
    });

    test('should exit with code 0 by default', () => {
      const exitSpy = jest.spyOn(process, 'exit');
      exit({
        message: 'foo',
      });
      expect(exitSpy).toHaveBeenCalledWith(0);
      exitSpy.mockReset();
      exitSpy.mockRestore();
    });

    test('should exit without message by default', () => {
      const logSpy = jest.spyOn(console, 'log');
      exit({
        code: 0,
      });
      expect(logSpy).not.toHaveBeenCalled();
      logSpy.mockReset();
      logSpy.mockRestore();
    });

    test('should exit with the given code', () => {
      const exitSpy = jest.spyOn(process, 'exit');
      exit({
        code: 1,
      });
      expect(exitSpy).toHaveBeenCalledWith(1);
      exitSpy.mockReset();
      exitSpy.mockRestore();
    });

    test('should exit with success message', () => {
      const logSpy = jest.spyOn(console, 'log');
      const exitSpy = jest.spyOn(process, 'exit');
      exit({
        code: 0,
        message: 'bar',
      });
      expect(logSpy).toHaveBeenCalledWith(chalk.bold.green('\n\tbar\n'));
      expect(exitSpy).toHaveBeenCalledWith(0);
      logSpy.mockReset();
      logSpy.mockRestore();
      exitSpy.mockReset();
      exitSpy.mockRestore();
    });

    test('should exit with error message', () => {
      const logSpy = jest.spyOn(console, 'error');
      const exitSpy = jest.spyOn(process, 'exit');
      exit({
        code: 1,
        message: 'baz',
      });
      expect(logSpy).toHaveBeenCalledWith(chalk.bold.red('\n\tbaz\n'));
      expect(exitSpy).toHaveBeenCalledWith(1);
      logSpy.mockReset();
      logSpy.mockRestore();
      exitSpy.mockReset();
      exitSpy.mockRestore();
    });
  });

  describe('copy', () => {
    test('should copy file', (done) => {
      const src = path.join(__dirname, '../../package.json');
      const dest = path.join(__dirname, '../../temp/package.json');
      copy(src, dest)
        .then(() => {
          expect(fs.readFileSync(src, 'utf8')).toEqual(fs.readFileSync(dest, 'utf8'));
          done();
        })
        .catch((err) => {
          throw new Error(err);
        });
    });
  });
});
