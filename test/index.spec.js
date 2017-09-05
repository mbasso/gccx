import gccx from '../src/';
import tests from './tests';

describe('parser', () => {
  tests.forEach(({
    message,
    input,
    output,
  }) => {
    test(message, () => {
      expect(gccx.parse(input)).toEqual(output);
    });
  });
});
