import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import promisify from 'es6-promisify';

const exec = promisify(childProcess.exec);

const exit = (...messages) => {
  // eslint-disable-next-line
  console.error(...messages);
  process.exit(1);
};

jest.setTimeout(60000);

describe('compiled cpp validity', () => {
  try {
    fs.readdirSync(__dirname).forEach((file) => {
      if (/\.cpp$/.test(file)) {
        test(file, (done) => {
          exec(`emcc --bind -s \"EXPORTED_RUNTIME_METHODS=['UTF8ToString']\" -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s ELIMINATE_DUPLICATE_FUNCTIONS=1 -s ABORTING_MALLOC=1 -s NO_EXIT_RUNTIME=1 -s NO_FILESYSTEM=1 -s DISABLE_EXCEPTION_CATCHING=2 ${path.join(__dirname, file)} ./node_modules/asm-dom/cpp/asm-dom.cpp -o ./temp/${file.replace(/\.cpp$/, '')}.asm.js`)
            .then(done)
            .catch((emccError) => {
              exec(`exec error: ${emccError}`);
            });
        });
      }
    });
  } catch (ex) {
    exit('Could not list the directory.', ex);
  }
});
