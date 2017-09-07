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
      } else if (Array.isArray(input)) {
        for (let i = 0; i < input.length; i += 1) {
          expect(gccx.parse(input[i])).toEqual(output[i]);
        }
      } else {
        expect(gccx.parse(input)).toEqual(output);
      }
    });
  });
});
