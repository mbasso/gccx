import gccx from '../src/';
import tests from './tests';

describe('parser', () => {
  tests.forEach(({
    message,
    input,
    output,
    error,
  }) => {
    test(message, () => {
      if (error !== undefined) {
        expect(() => gccx.parse(input)).toThrowError(error);
      } else {
        expect(gccx.parse(input)).toEqual(output);
      }
    });
  });
});
