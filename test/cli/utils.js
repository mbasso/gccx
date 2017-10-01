import path from 'path';
import childProcess from 'child_process';
import getStream from 'get-stream';

const cliPath = path.join(__dirname, '../../bin/cli/index.js');

// eslint-disable-next-line
export const execCli = (args, opts, cb) => {
  let dirname;
  let env;

  if (typeof opts === 'function') {
    // eslint-disable-next-line
    cb = opts;
    dirname = __dirname;
    env = {};
  } else {
    dirname = path.join(__dirname, opts.dirname ? opts.dirname : '');
    env = opts.env || {};
  }

  let child;
  let stdout;
  let stderr;

  const processPromise = new Promise((resolve) => {
    child = childProcess.spawn(process.execPath, [cliPath].concat(args), {
      cwd: dirname,
      env,
      stdio: [null, 'pipe', 'pipe'],
    });

    child.on('close', (code, signal) => {
      if (code) {
        const err = new Error(code);
        err.code = code;
        err.signal = signal;
        resolve(err);
        return;
      }

      resolve(code);
    });

    stdout = getStream(child.stdout);
    stderr = getStream(child.stderr);
  });

  Promise.all([processPromise, stdout, stderr]).then((res) => {
    cb(...res);
  });

  return child;
};
