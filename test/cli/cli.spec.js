import { version } from '../../package.json';
import { execCli } from './utils';

describe('cli', () => {
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
});
