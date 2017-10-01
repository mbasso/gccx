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

//eslint-disable-next-line
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
