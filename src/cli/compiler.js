import fs from 'fs';
import path from 'path';
import parser from '../';
import { copy } from './utils';

const compile = (pathIn, pathOut, opts, ignoreChecks = false) => {
  const file = fs.lstatSync(pathIn);
  if (file.isFile()) {
    let compilable = true;
    if (!ignoreChecks) {
      if (compilable && opts.extensions) {
        compilable = opts.extensions.reduce(
          (res, ext) => res || pathIn.lastIndexOf(ext) === pathIn.length - ext.length,
          false,
        );
      }
      if (compilable && opts.ignore) {
        compilable = !(new RegExp(opts.ignore)).test(pathIn);
      }
    }
    if (compilable) {
      const code = parser.parse(fs.readFileSync(pathIn, 'utf8'));
      if (pathOut) {
        fs.writeFileSync(pathOut, code);
        // eslint-disable-next-line
        console.log(`${pathIn} -> ${pathOut}`);
      } else {
        // eslint-disable-next-line
        console.log(code);
      }
    } else if (opts.copyFiles) {
      return copy(pathIn, pathOut);
    }
  } else if (file.isDirectory()) {
    const compiles = fs.readdirSync(pathIn)
      .map((subPath) => {
        const pathInSub = path.join(pathIn, subPath);
        const pathOutSub = path.join(pathOut, subPath);

        if (fs.lstatSync(pathInSub).isDirectory()) {
          if (!fs.existsSync(pathOutSub)) {
            fs.mkdirSync(pathOutSub);
          }
        }

        return compile(pathInSub, pathOutSub, opts);
      });
    return Promise.all(compiles);
  }
  return Promise.resolve();
};

export default compile;
