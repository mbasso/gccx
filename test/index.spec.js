import gccx from '../src/';
import tests from './tests';

describe('parser', () => {
  tests.forEach(({
    message,
    input,
    output,
    error,
    errors,
  }) => {
    test(message, () => {
      // single test with error
      if (error !== undefined) {
        expect(() => gccx.parse(input)).toThrowError(error);
      // multiple tests with error
      } else if (Array.isArray(errors)) {
        for (let i = 0; i < input.length; i += 1) {
          expect(() => gccx.parse(input[i])).toThrowError(errors[i]);
        }
      // multiple tests
      } else if (Array.isArray(input)) {
        for (let i = 0; i < input.length; i += 1) {
          expect(gccx.parse(input[i])).toEqual(output[i]);
        }
      // single test
      } else {
        expect(gccx.parse(input)).toEqual(output);
      }
    });
  });
});
