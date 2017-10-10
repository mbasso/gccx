import fs from 'fs';
import chalk from 'chalk';

const print = ({
  color,
  message,
}) => {
  //eslint-disable-next-line
  console.log(chalk.bold[color](message));
};

const error = message => print({
  color: 'red',
  message,
});

const success = message => print({
  color: 'green',
  message,
});

export const exit = ({ code = 0, message = '' } = {}) => {
  if (message) {
    const text = `\n\t${message}\n`;
    if (code === 0) {
      success(text);
    } else {
      error(text);
    }
  }
  process.exit(code);
};

export const copy = (src, dest) => new Promise((resolve, reject) => {
  const readStream = fs.createReadStream(src);
  readStream.once('error', reject);
  readStream.once('end', resolve);
  readStream.pipe(fs.createWriteStream(dest));
});
