import fs from 'fs-extra';
import chalk from 'chalk';

const print = ({ color, message, type = 'log' }) => {
  // eslint-disable-next-line
  console[type](chalk.bold[color](message));
};

const error = message =>
  print({
    color: 'red',
    message,
    type: 'error',
  });

const success = message =>
  print({
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

export const { copy } = fs;
