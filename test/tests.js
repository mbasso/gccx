export default [
  {
    message: 'should handle non trimmed input',
    input: `
      <span />
    `,
    output: 'asmdom::h("span")',
  },
  {
    message: 'should parse tags with spaces',
    input: '<  span /  >',
    output: 'asmdom::h("span")',
  },
  {
    message: 'should parse self closing tags without attributes',
    input: '<span />',
    output: 'asmdom::h("span")',
  },
  {
    message: 'should support dashed selectors',
    input: '<foo-bar />',
    output: 'asmdom::h("foo-bar")',
  },
  {
    message: 'should support namespace selectors',
    input: '<foo:bar />',
    output: 'asmdom::h("foo:bar")',
  },
  {
    message: 'should parse comments',
    input: '<!-- Hello world! -->',
    output: 'asmdom::h("!", std::string(" Hello world! "))',
  },
  {
    message: 'should escape quotes in comments',
    input: '<!-- Hello " world! -->',
    output: 'asmdom::h("!", std::string(" Hello \" world! "))',
  },
  {
    message: 'should parse comments with spaces',
    input: '<!--  -->',
    output: 'asmdom::h("!", std::string("  "))',
  },
  {
    message: 'should parse empty comments',
    input: '<!---->',
    output: 'asmdom::h("!", std::string(""))',
  },
  {
    message: 'should parse an empty tag with open and close',
    input: '<span></span>',
    output: 'asmdom::h("span")',
  },
  {
    message: 'should parse an empty tag with spaces',
    input: '<  span  >   <  /   span  >',
    output: 'asmdom::h("span")',
  },
  {
    message: 'should optimize tags with one child',
    input: `
      <div>
        <span></span>
      </div>
    `,
    output: 'asmdom::h("div", asmdom::h("span"))',
  },
  {
    message: 'should optimize tags with text child',
    input: `
      <div>
        Hello world!
      </div>
    `,
    output: 'asmdom::h("div", std::string("Hello world!"))',
  },
  {
    message: 'should escape quotes in text child',
    input: `
      <div>
        Hello " world!
      </div>
    `,
    output: 'asmdom::h("div", std::string("Hello \" world!"))',
  },
  {
    message: 'should parse code as child',
    input: `
      <div>
        { function(foo, bar) }
      </div>
    `,
    output: 'asmdom::h("div", function(foo, bar))',
  },
  {
    message: 'should parse comment as child',
    input: `
      <div>
        { /* comment here */ }
      </div>
    `,
    output: 'asmdom::h("div")',
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
    output: 'asmdom::h("div", Children {function(foo, bar), asmdom::h("Hello world!", true), asmdom::h("input")})',
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
    error: 'Error while parsing cpx code at line 6: open tag "div" does not match close tag "span"',
  },
];
