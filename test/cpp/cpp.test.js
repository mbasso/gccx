const fs = require('fs');
const path = require('path');
const process = require('process');
const childProcess = require('child_process');
const promisify = require('es6-promisify');

const exec = promisify(childProcess.exec);

const exit = (...messages) => {
  // esline-disable-next-line
  console.error(...messages);
  process.exit(1);
};

jest.setTimeout(100000);

describe('cpp output', () => {
  test('should compile files', (done) => {
    fs.readdir(__dirname, (err, files) => {
      if (err) {
        exit('Could not list the directory.', err);
      }

      const commands = [];

      files.forEach((file) => {
        if (/\.cpp$/.test(file)) {
          commands.push(exec(`emcc --bind -s \"EXPORTED_RUNTIME_METHODS=['UTF8ToString']\" -s AGGRESSIVE_VARIABLE_ELIMINATION=1 -s ELIMINATE_DUPLICATE_FUNCTIONS=1 -s ABORTING_MALLOC=1 -s NO_EXIT_RUNTIME=1 -s NO_FILESYSTEM=1 -s DISABLE_EXCEPTION_CATCHING=2 ${path.join(__dirname, file)} ./node_modules/asm-dom/cpp/asm-dom.cpp -o ./temp/${file.replace(/\.cpp$/, '')}.asm.js`));
        }
      });

      Promise.all(commands).then(() => {
        done();
      }).catch((emccError) => {
        exec(`exec error: ${emccError}`);
      });
    });
  });
});
