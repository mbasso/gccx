export default [
  {
    message: 'should handle non trimmed input',
    input: `
      <span />
    `,
    output: 'asmdom::h(u8"span")',
  },
  {
    message: 'should parse tags with spaces',
    input: '<  span /  >',
    output: 'asmdom::h(u8"span")',
  },
  {
    message: 'should parse self closing tags without attributes',
    input: '<span />',
    output: 'asmdom::h(u8"span")',
  },
  {
    message: 'should support dashed selectors',
    input: '<foo-bar />',
    output: 'asmdom::h(u8"foo-bar")',
  },
  {
    message: 'should support namespace selectors',
    input: '<foo:bar />',
    output: 'asmdom::h(u8"foo:bar")',
  },
  {
    message: 'should parse comments',
    input: '<!-- Hello world! -->',
    output: 'asmdom::h(u8"!", std::string(u8" Hello world! "))',
  },
  {
    message: 'should escape quotes in comments',
    input: '<!-- Hello " world! -->',
    output: 'asmdom::h(u8"!", std::string(u8" Hello \" world! "))',
  },
  {
    message: 'should parse comments with spaces',
    input: '<!--  -->',
    output: 'asmdom::h(u8"!", std::string(u8"  "))',
  },
  {
    message: 'should parse empty comments',
    input: '<!---->',
    output: 'asmdom::h(u8"!", std::string(u8""))',
  },
  {
    message: 'should parse an empty tag with open and close',
    input: '<span></span>',
    output: 'asmdom::h(u8"span")',
  },
  {
    message: 'should parse an empty tag with spaces',
    input: '<  span  >   <  /   span  >',
    output: 'asmdom::h(u8"span")',
  },
  {
    message: 'should optimize tags with one child',
    input: `
      <div>
        <span></span>
      </div>
    `,
    output: 'asmdom::h(u8"div", asmdom::h(u8"span"))',
  },
  {
    message: 'should optimize tags with text child',
    input: `
      <div>
        Hello world!
      </div>
    `,
    output: 'asmdom::h(u8"div", std::string(u8"Hello world!"))',
  },
  {
    message: 'should escape quotes in text child',
    input: `
      <div>
        Hello " world!
      </div>
    `,
    output: 'asmdom::h(u8"div", std::string(u8"Hello \" world!"))',
  },
  {
    message: 'should parse code as child',
    input: `
      <div>
        { function(foo, bar) }
      </div>
    `,
    output: 'asmdom::h(u8"div", function(foo, bar))',
  },
  {
    message: 'should parse code as VNode',
    input: `
      <div>
        {:VNode function(foo, bar) }
      </div>
    `,
    output: 'asmdom::h(u8"div", function(foo, bar))',
  },
  {
    message: 'should parse code as string',
    input: [
      `
        <div>
          {:string function(foo, bar) }
        </div>
      `,
      `
        <div>
          Hello {:string function(foo, bar) }
        </div>
      `,
      `
        <div>
          {:string function(foo, bar) } foo
        </div>
      `,
      `
        <div>
          {:string function(foo, bar) } {:string function(baz) }
        </div>
      `,
      `
        <div>
          Hello {:string function(foo, bar) } foo
        </div>
      `,
    ],
    output: [
      'asmdom::h(u8"div", std::string(function(foo, bar)))',
      'asmdom::h(u8"div", u8"Hello " + std::string(function(foo, bar)))',
      'asmdom::h(u8"div", std::string(function(foo, bar)) + u8" foo")',
      'asmdom::h(u8"div", std::string(function(foo, bar)) + std::string(function(baz)))',
      'asmdom::h(u8"div", u8"Hello " + std::string(function(foo, bar)) + u8" foo")',
    ],
  },
  {
    message: 'should parse comment as child',
    input: `
      <div>
        { /* comment here */ }
      </div>
    `,
    output: 'asmdom::h(u8"div")',
  },
  {
    message: 'should parse multiple children of different type',
    input: `
      <div>
        { /* comment here */ }
        { function(foo, bar) }
        Hello world!
        <input />
      </div>
    `,
    output: 'asmdom::h(u8"div", Children {function(foo, bar), asmdom::h(u8"Hello world!", true), asmdom::h(u8"input")})',
  },
  {
    message: 'should throw if open and close tags not match',
    input: `
      <div>
        { /* comment here */ }
        { function(foo, bar) }
        Hello world!
        <input />
      </span>
    `,
    error: 'Error while parsing CPX code at line 6: open tag "div" does not match close tag "span"',
  },
];
