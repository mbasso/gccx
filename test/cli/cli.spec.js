import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import { version } from '../../package.json';
import { execCli } from './utils';

describe('cli', () => {
  const tempDir = path.join(__dirname, '../../temp');

  beforeAll((done) => {
    const createTempDir = () => {
      fs.mkdirSync(tempDir);
      done();
    };
    if (fs.existsSync(tempDir)) {
      rimraf(tempDir, createTempDir);
    } else {
      createTempDir();
    }
  });

  test('should output help if input is not provided', (done) => {
    execCli([], (err, stdout) => {
      expect(/^\s*Usage:/.test(stdout)).toBeTruthy();
      done();
    });
  });

  test('should exit with code 1 if input is not provided', (done) => {
    execCli([], (err) => {
      expect(err).toBeDefined();
      expect(err.message).toEqual('1');
      done();
    });
  });

  ['-V', '--version'].forEach((command) => {
    test(`should output version with ${command}`, (done) => {
      execCli([command], (err, stdout) => {
        expect(err).toEqual(0);
        const versionRegex = new RegExp(`^\s*${version}`);
        expect(versionRegex.test(stdout)).toBeTruthy();
        done();
      });
    });
  });

  ['-h', '--help'].forEach((command) => {
    test(`should output help with ${command}`, (done) => {
      execCli([command], (err, stdout) => {
        expect(err).toEqual(0);
        expect(/^\s*Usage:/.test(stdout)).toBeTruthy();
        done();
      });
    });
  });

  ['-o', '--output'].forEach((command) => {
    const output = path.join(__dirname, '../../temp/span.cpp');
    test(`should compile file with ${command}`, (done) => {
      execCli(['files/span.cpp', command, output], (err) => {
        expect(err).toEqual(0);
        done();
      });
    });
  });

  test('should compile file and print code if output is not provided', (done) => {
    execCli(['files/span.cpp'], (err, stdout) => {
      expect(err).toEqual(0);
      expect(stdout.trim()).toEqual('asmdom::h(u8"span")');
      done();
    });
  });

  test('should compile file and write output in file', (done) => {
    const output = path.join(__dirname, '../../temp/span.cpp');
    execCli(['files/span.cpp', '-o', output], (err, stdout) => {
      expect(err).toEqual(0);
      expect(fs.readFileSync(output, 'utf8')).toEqual('asmdom::h(u8"span")');
      expect(stdout.trim()).toEqual(`files/span.cpp -> ${output}`);
      done();
    });
  });

  test('should compile a directory with only cpp files', (done) => {
    const inputDir = path.join('files', 'cpp');
    const inputSpan = path.join(inputDir, 'span.cpp');
    const inputDiv = path.join(inputDir, 'div.cpp');

    const outputDir = path.join(__dirname, '../../temp/cpp');
    fs.mkdirSync(outputDir);
    const outputSpan = path.join(outputDir, 'span.cpp');
    const outputDiv = path.join(outputDir, 'div.cpp');

    execCli([inputDir, '-o', outputDir], (err, stdout) => {
      expect(err).toEqual(0);
      expect(
        fs.readFileSync(outputSpan, 'utf8'),
      ).toEqual('asmdom::h(u8"span")');
      expect(
        fs.readFileSync(outputDiv, 'utf8'),
      ).toEqual('asmdom::h(u8"div")');
      expect(stdout.trim()).toEqual(`
        ${inputDiv} -> ${outputDiv}\n${inputSpan} -> ${outputSpan}
      `.trim());
      done();
    });
  });

  ['-i', '--ignore'].forEach((command) => {
    test(`should ignore files with ${command}`, (done) => {
      const inputDir = path.join('files', 'cpp');
      const inputDiv = path.join(inputDir, 'div.cpp');

      const outputDir = path.join(__dirname, '../../temp/ignoreFiles');
      let clean = Promise.resolve();
      if (fs.existsSync(outputDir)) {
        clean = new Promise((resolve) => {
          rimraf(outputDir, resolve);
        });
      }
      clean.then(() => {
        fs.mkdirSync(outputDir);
        const outputSpan = path.join(outputDir, 'span.cpp');
        const outputDiv = path.join(outputDir, 'div.cpp');

        execCli([inputDir, '-o', outputDir, command, 'span'], (err, stdout) => {
          expect(err).toEqual(0);
          expect(
            fs.readFileSync(outputSpan, 'utf8'),
          ).toEqual('<span />');
          expect(
            fs.readFileSync(outputDiv, 'utf8'),
          ).toEqual('asmdom::h(u8"div")');
          expect(stdout.trim()).toEqual(`
          ${inputDiv} -> ${outputDiv}
        `.trim());
          done();
        });
      });
    });
  });

  ['-x', '--extensions'].forEach((command) => {
    test(`should parse only the extensions given by ${command}`, (done) => {
      const inputDir = path.join('files', 'extensions');
      const inputDiv = path.join(inputDir, 'div.md');
      const inputImg = path.join(inputDir, 'img.example');

      const outputDir = path.join(__dirname, '../../temp/extensions');
      let clean = Promise.resolve();
      if (fs.existsSync(outputDir)) {
        clean = new Promise((resolve) => {
          rimraf(outputDir, resolve);
        });
      }
      clean.then(() => {
        fs.mkdirSync(outputDir);
        const outputSpan = path.join(outputDir, 'span.cpp');
        const outputDiv = path.join(outputDir, 'div.md');
        const outputImg = path.join(outputDir, 'img.example');

        execCli([inputDir, '-o', outputDir, command, '.md,.example'], (err, stdout) => {
          expect(err).toEqual(0);
          expect(
            fs.readFileSync(outputSpan, 'utf8'),
          ).toEqual('<span />');
          expect(
            fs.readFileSync(outputDiv, 'utf8'),
          ).toEqual('asmdom::h(u8"div")');
          expect(
            fs.readFileSync(outputImg, 'utf8'),
          ).toEqual('asmdom::h(u8"img")');
          expect(stdout.trim()).toEqual(`
          ${inputDiv} -> ${outputDiv}\n${inputImg} -> ${outputImg}
        `.trim());
          done();
        });
      });
    });
  });

  test('should copy files', (done) => {
    const inputDir = path.join('files', 'resources');
    const outputDir = path.join(__dirname, '../../temp/copied');
    const outputFile = path.join(outputDir, 'foo.md');
    fs.mkdirSync(outputDir);

    execCli([inputDir, '-o', outputDir], (err, stdout) => {
      expect(err).toEqual(0);
      expect(fs.readdirSync(outputDir)).toEqual(['foo.md']);
      expect(
        fs.readFileSync(outputFile, 'utf8'),
      ).toEqual('example');
      expect(stdout.trim()).toEqual('');
      done();
    });
  });

  test('should not copy files', (done) => {
    const inputDir = path.join('files', 'resources');
    const outputDir = path.join(__dirname, '../../temp/notCopied');
    fs.mkdirSync(outputDir);

    execCli([inputDir, '-o', outputDir, '--no-copy-files'], (err, stdout) => {
      expect(err).toEqual(0);
      expect(fs.readdirSync(outputDir)).toEqual([]);
      expect(stdout.trim()).toEqual('');
      done();
    });
  });

  test('should get config from .gccxrc', (done) => {
    const inputDir = path.join('files', 'gccxrc');
    const inputSpan = path.join(inputDir, 'span.cpp');

    const outputDir = path.join(__dirname, '../../temp/gccxrc');
    let clean = Promise.resolve();
    if (fs.existsSync(outputDir)) {
      clean = new Promise((resolve) => {
        rimraf(outputDir, resolve);
      });
    }
    clean.then(() => {
      fs.mkdirSync(outputDir);
      const outputSpan = path.join(outputDir, 'span.cpp');
      const outputDiv = path.join(outputDir, 'div.md');
      const outputImg = path.join(outputDir, 'img.cc');

      execCli([inputDir, '-o', outputDir], (err, stdout) => {
        expect(err).toEqual(0);
        expect(
          fs.readFileSync(outputImg, 'utf8'),
        ).toEqual('<img />');
        expect(
          fs.readFileSync(outputDiv, 'utf8'),
        ).toEqual('<div />');
        expect(
          fs.readFileSync(outputSpan, 'utf8'),
        ).toEqual('asmdom::h(u8"span")');
        expect(stdout.trim()).toEqual(`
          ${inputSpan} -> ${outputSpan}
        `.trim());
        done();
      });
    });
  });

  test('should not get config from .gccxrc', (done) => {
    const inputDir = path.join('files', 'gccxrc');
    const inputSpan = path.join(inputDir, 'span.cpp');
    const inputImg = path.join(inputDir, 'img.cc');

    const outputDir = path.join(__dirname, '../../temp/gccxrc');
    let clean = Promise.resolve();
    if (fs.existsSync(outputDir)) {
      clean = new Promise((resolve) => {
        rimraf(outputDir, resolve);
      });
    }
    clean.then(() => {
      fs.mkdirSync(outputDir);
      const outputSpan = path.join(outputDir, 'span.cpp');
      const outputDiv = path.join(outputDir, 'div.md');
      const outputImg = path.join(outputDir, 'img.cc');

      execCli([inputDir, '-o', outputDir, '--no-gccxrc'], (err, stdout) => {
        expect(err).toEqual(0);
        expect(
          fs.readFileSync(outputImg, 'utf8'),
        ).toEqual('asmdom::h(u8"img")');
        expect(
          fs.readFileSync(outputDiv, 'utf8'),
        ).toEqual('<div />');
        expect(
          fs.readFileSync(outputSpan, 'utf8'),
        ).toEqual('asmdom::h(u8"span")');
        expect(stdout.trim()).toEqual(`
          ${inputImg} -> ${outputImg}\n${inputSpan} -> ${outputSpan}
        `.trim());
        done();
      });
    });
  });

  test('should prefer cli opts over .gccxrc', (done) => {
    const inputDir = path.join('files', 'gccxrc');
    const inputImg = path.join(inputDir, 'img.cc');

    const outputDir = path.join(__dirname, '../../temp/gccxrc');
    let clean = Promise.resolve();
    if (fs.existsSync(outputDir)) {
      clean = new Promise((resolve) => {
        rimraf(outputDir, resolve);
      });
    }
    clean.then(() => {
      fs.mkdirSync(outputDir);
      const outputSpan = path.join(outputDir, 'span.cpp');
      const outputDiv = path.join(outputDir, 'div.md');
      const outputImg = path.join(outputDir, 'img.cc');

      execCli([inputDir, '-o', outputDir, '-x', '.cc'], (err, stdout) => {
        expect(err).toEqual(0);
        expect(
          fs.readFileSync(outputImg, 'utf8'),
        ).toEqual('asmdom::h(u8"img")');
        expect(
          fs.readFileSync(outputDiv, 'utf8'),
        ).toEqual('<div />');
        expect(
          fs.readFileSync(outputSpan, 'utf8'),
        ).toEqual('<span />');
        expect(stdout.trim()).toEqual(`
          ${inputImg} -> ${outputImg}
        `.trim());
        done();
      });
    });
  });

  test('should do nothing with non compilable and non copiable files', (done) => {
    const inputDir = path.join('files', 'resources');
    const outputDir = path.join(__dirname, '../../temp/resources');
    fs.mkdirSync(outputDir);

    execCli([inputDir, '-o', outputDir, '--no-copy-files'], (err, stdout) => {
      expect(err).toEqual(0);
      expect(fs.readdirSync(outputDir)).toEqual([]);
      expect(stdout.trim()).toEqual('');
      done();
    });
  });

  test('should compile folder tree', (done) => {
    const inputDir = path.join('files', 'tree');
    const outputDir = path.join(__dirname, '../../temp/compiledTree');
    fs.mkdirSync(outputDir);

    execCli([inputDir, '-o', outputDir], (err, stdout) => {
      expect(err).toEqual(0);
      expect(fs.readdirSync(outputDir)).toEqual(['div.cpp', 'example.md', 'firstLevel']);
      expect(
        fs.readFileSync(path.join(outputDir, 'div.cpp'), 'utf8'),
      ).toEqual('asmdom::h(u8"div")');
      expect(
        fs.readFileSync(path.join(outputDir, 'example.md'), 'utf8'),
      ).toEqual('example');

      const firstLevelDir = path.join(outputDir, 'firstLevel');
      expect(fs.readdirSync(firstLevelDir)).toEqual(['secondLevel', 'secondLevel2', 'span.cpp']);
      expect(
        fs.readFileSync(path.join(firstLevelDir, 'span.cpp'), 'utf8'),
      ).toEqual('asmdom::h(u8"span")');

      const secondLevelDir = path.join(firstLevelDir, 'secondLevel');
      expect(fs.readdirSync(secondLevelDir)).toEqual(['foo.md']);
      expect(
        fs.readFileSync(path.join(secondLevelDir, 'foo.md'), 'utf8'),
      ).toEqual('foo');

      const secondLevel2Dir = path.join(firstLevelDir, 'secondLevel2');
      expect(fs.readdirSync(secondLevel2Dir)).toEqual(['img.cpp']);
      expect(
        fs.readFileSync(path.join(secondLevel2Dir, 'img.cpp'), 'utf8'),
      ).toEqual('asmdom::h(u8"img")');

      expect(stdout.trim()).toEqual(
        `${path.join(inputDir, 'div.cpp')} -> ${path.join(outputDir, 'div.cpp')}\n` +
        `${path.join(inputDir, 'firstLevel', 'secondLevel2', 'img.cpp')} -> ${path.join(secondLevel2Dir, 'img.cpp')}\n` +
        `${path.join(inputDir, 'firstLevel', 'span.cpp')} -> ${path.join(firstLevelDir, 'span.cpp')}`,
      );
      done();
    });
  });

  test('should compile ignore folder', (done) => {
    const inputDir = path.join('files', 'tree');
    const outputDir = path.join(__dirname, '../../temp/ignoreFolder');
    fs.mkdirSync(outputDir);

    execCli([inputDir, '-o', outputDir, '-i', 'firstLevel'], (err, stdout) => {
      expect(err).toEqual(0);
      expect(fs.readdirSync(outputDir)).toEqual(['div.cpp', 'example.md', 'firstLevel']);
      expect(
        fs.readFileSync(path.join(outputDir, 'div.cpp'), 'utf8'),
      ).toEqual('asmdom::h(u8"div")');
      expect(
        fs.readFileSync(path.join(outputDir, 'example.md'), 'utf8'),
      ).toEqual('example');

      const firstLevelDir = path.join(outputDir, 'firstLevel');
      expect(fs.readdirSync(firstLevelDir)).toEqual(['secondLevel', 'secondLevel2', 'span.cpp']);
      expect(
        fs.readFileSync(path.join(firstLevelDir, 'span.cpp'), 'utf8'),
      ).toEqual('<span />');

      const secondLevelDir = path.join(firstLevelDir, 'secondLevel');
      expect(fs.readdirSync(secondLevelDir)).toEqual(['foo.md']);
      expect(
        fs.readFileSync(path.join(secondLevelDir, 'foo.md'), 'utf8'),
      ).toEqual('foo');

      const secondLevel2Dir = path.join(firstLevelDir, 'secondLevel2');
      expect(fs.readdirSync(secondLevel2Dir)).toEqual(['img.cpp']);
      expect(
        fs.readFileSync(path.join(secondLevel2Dir, 'img.cpp'), 'utf8'),
      ).toEqual('<img />');

      expect(stdout.trim()).toEqual((
        `${path.join(inputDir, 'div.cpp')} -> ${path.join(outputDir, 'div.cpp')}`
      ).trim());
      done();
    });
  });

  ['-w', '--watch'].forEach((command) => {
    test(`should watch with ${command}`, (done) => {
      let killed = false;
      const inputDir = path.join(tempDir, 'watch');
      if (!fs.existsSync(inputDir)) {
        fs.mkdirSync(inputDir);
      }
      const input = path.join(inputDir, 'span.cpp');
      fs.writeFileSync(input, '<span />');

      const child = execCli([input, command], () => {
        expect(
          fs.readFileSync(input, 'utf8'),
        ).toEqual('<span      />');
        expect(killed).toEqual(true);
        done();
      });

      let buffer = '';
      let passedFirst = false;
      child.stdout.on('data', (str) => {
        buffer += str;
        if (/asmdom::h\(u8"span"\)/.test(buffer)) {
          if (!passedFirst) {
            fs.writeFileSync(input, '<span      />');
            buffer = '';
            passedFirst = true;
          } else if (!killed) {
            child.kill();
            killed = true;
          }
        }
      });
    });
  });

  test('should recompile files when they changed', (done) => {
    let killed = false;
    const inputDir = path.join(tempDir, 'watchFile');
    fs.mkdirSync(inputDir);
    const input = path.join(inputDir, 'span.cpp');
    fs.writeFileSync(input, '<span />');

    const output = path.join(__dirname, '../../temp/watched.cpp');

    const child = execCli([input, '-w', '-o', output], () => {
      expect(
        fs.readFileSync(input, 'utf8'),
      ).toEqual('<span     />');
      expect(
        fs.readFileSync(output, 'utf8'),
      ).toEqual('asmdom::h(u8"span")');
      fs.writeFileSync(input, '<span />');
      expect(killed).toEqual(true);
      done();
    });

    let buffer = '';
    let passedFirst = false;
    child.stdout.on('data', (str) => {
      buffer += str;
      if (/span.cpp ->/.test(buffer)) {
        if (!passedFirst) {
          fs.writeFileSync(input, '<span     />');
          buffer = '';
          passedFirst = true;
        } else if (!killed) {
          child.kill();
          killed = true;
        }
      }
    });
  });

  test('should compile new files', (done) => {
    let killed = false;
    const inputDir = path.join(tempDir, 'watchNewFiles');
    fs.mkdirSync(inputDir);
    const input = path.join(inputDir, 'span.cpp');
    fs.writeFileSync(input, '<span />');
    const inputDiv = path.join(inputDir, 'div.cpp');

    const outputDir = path.join(__dirname, '../../temp/watchedNewFiles');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const output = path.join(outputDir, 'span.cpp');
    const outputDiv = path.join(outputDir, 'div.cpp');

    const child = execCli([inputDir, '-w', '-o', outputDir], () => {
      expect(
        fs.readFileSync(output, 'utf8'),
      ).toEqual('asmdom::h(u8"span")');
      expect(
        fs.readFileSync(outputDiv, 'utf8'),
      ).toEqual('asmdom::h(u8"div")');
      expect(killed).toEqual(true);
      done();
    });

    let buffer = '';
    let passedFirst = false;
    child.stdout.on('data', (str) => {
      buffer += str;
      if (/span.cpp ->/.test(buffer) && !passedFirst) {
        fs.writeFileSync(inputDiv, '<div />');
        buffer = '';
        passedFirst = true;
      } else if (/div.cpp ->/.test(buffer) && passedFirst && !killed) {
        child.kill();
        killed = true;
      }
    });
  });

  test('should recompile files in dir when they changed', (done) => {
    let killed = false;
    const inputDir = path.join(tempDir, 'watchFilesInDir');
    fs.mkdirSync(inputDir);
    const input = path.join(inputDir, 'span.cpp');
    fs.writeFileSync(input, '<span />');
    const inputDiv = path.join(inputDir, 'div.cpp');
    fs.writeFileSync(inputDiv, '<div />');

    const outputDir = path.join(__dirname, '../../temp/watchedFilesInDir');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const output = path.join(outputDir, 'span.cpp');
    const outputDiv = path.join(outputDir, 'div.cpp');

    const child = execCli([inputDir, '-w', '-o', outputDir], () => {
      expect(
        fs.readFileSync(output, 'utf8'),
      ).toEqual('asmdom::h(u8"span")');
      expect(
        fs.readFileSync(outputDiv, 'utf8'),
      ).toEqual('asmdom::h(u8"div")');
      expect(
        fs.readFileSync(inputDiv, 'utf8'),
      ).toEqual('<div   />');
      expect(killed).toEqual(true);
      done();
    });

    let buffer = '';
    let passedFirst = false;
    child.stdout.on('data', (str) => {
      buffer += str;
      if (/span.cpp ->/.test(buffer) && !passedFirst) {
        fs.writeFileSync(inputDiv, '<div   />');
        buffer = '';
        passedFirst = true;
      } else if (/div.cpp ->/.test(buffer) && passedFirst && !killed) {
        child.kill();
        killed = true;
      }
    });
  });

  test('should add new directories', (done) => {
    let killed = false;
    const inputDir = path.join(tempDir, 'watchNewDir');
    fs.mkdirSync(inputDir);
    const input = path.join(inputDir, 'span.cpp');
    fs.writeFileSync(input, '<span />');
    const newInputDir = path.join(inputDir, 'dir');

    const outputDir = path.join(__dirname, '../../temp/watchedNewDir');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const newOutputDir = path.join(outputDir, 'dir');

    const child = execCli([inputDir, '-w', '-o', outputDir], () => {
      expect(fs.existsSync(newOutputDir)).toEqual(true);
      expect(killed).toEqual(true);
      done();
    });

    let buffer = '';
    let passedFirst = false;
    child.stdout.on('data', (str) => {
      buffer += str;
      if (/span.cpp ->/.test(buffer) && !passedFirst) {
        fs.mkdirSync(newInputDir);
        buffer = '';
        passedFirst = true;
      } else if (passedFirst && !killed) {
        child.kill();
        killed = true;
      }
    });
  });

  test('should copy new non-compilable files', (done) => {
    let killed = false;
    const inputDir = path.join(tempDir, 'watchNewNonCopiableFiles');
    fs.mkdirSync(inputDir);
    const input = path.join(inputDir, 'span.cpp');
    fs.writeFileSync(input, '<span />');
    const inputDiv = path.join(inputDir, 'div.md');
    fs.writeFileSync(inputDiv, '<div />');

    const outputDir = path.join(__dirname, '../../temp/watchedNewNonCopiableFiles');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const output = path.join(outputDir, 'span.cpp');
    const outputDiv = path.join(outputDir, 'div.md');

    const child = execCli([inputDir, '-w', '-o', outputDir], () => {
      expect(
        fs.readFileSync(output, 'utf8'),
      ).toEqual('asmdom::h(u8"span")');
      expect(
        fs.readFileSync(outputDiv, 'utf8'),
      ).toEqual('<div    />');
      expect(killed).toEqual(true);
      done();
    });

    let buffer = '';
    let passedFirst = false;
    child.stdout.on('data', (str) => {
      buffer += str;
      if (/span.cpp ->/.test(buffer) && !passedFirst) {
        fs.writeFileSync(inputDiv, '<div    />');
        buffer = '';
        passedFirst = true;
      } else if (passedFirst && !killed) {
        child.kill();
        killed = true;
      }
    });
  });

  // test('should do nothing with new non-copiable and non-compilable files')
});
