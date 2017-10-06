import fs from 'fs';
import path from 'path';
import parser from '../';
import { copy } from './utils';

const compile = (pathIn, pathOut, opts) => {
  const file = fs.lstatSync(pathIn);
  if (file.isFile()) {
    const code = parser.parse(fs.readFileSync(pathIn, 'utf8'));
    if (pathOut) {
      fs.writeFileSync(pathOut, code);
      // eslint-disable-next-line
      console.log(`${pathIn} -> ${pathOut}`);
    } else {
      // eslint-disable-next-line
      console.log(code);
    }
  } else if (file.isDirectory()) {
    const compiles = fs.readdirSync(pathIn)
      .map((subPath) => {
        const pathInSub = path.join(pathIn, subPath);
        const pathOutSub = path.join(pathOut, subPath);

        let compilable = true;
        if (compilable && opts.extensions) {
          compilable = opts.extensions.reduce(
            (res, ext) => res || pathInSub.lastIndexOf(ext) === pathInSub.length - ext.length,
            false,
          );
        }
        if (compilable && opts.ignore) {
          compilable = !(new RegExp(opts.ignore)).test(pathInSub);
        }
        if (compilable) {
          return compile(pathInSub, pathOutSub, opts);
        } else if (opts.copyFiles) {
          return copy(pathInSub, pathOutSub);
        }
        return Promise.resolve();
      });
    return Promise.all(compiles);
  }
  return Promise.resolve();
};

export default compile;
