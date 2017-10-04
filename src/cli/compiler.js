import fs from 'fs';
import parser from '../';

const compile = (pathIn, pathOut) => new Promise((resolve) => {
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
    resolve();
  }
});

export default compile;
