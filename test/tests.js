export default [
  {
    message: 'should handle non trimmed input',
    input: `
      <span />
    `,
    output: 'h("span")',
  },
  {
    message: 'should parse self closing tags without attributes',
    input: '<span />',
    output: 'h("span")',
  },
  {
    message: 'should support dashed selectors',
    input: '<foo-bar />',
    output: 'h("foo-bar")',
  },
  {
    message: 'should support namespace selectors',
    input: '<foo:bar />',
    output: 'h("foo:bar")',
  },
  {
    message: 'should parse comments',
    input: '<!-- Hello world! -->',
    output: 'h("!", std::string(" Hello world! "))',
  },
  {
    message: 'should parse an empty comment',
    input: '<!---->',
    output: 'h("!", std::string(""))',
  },
  {
    message: 'should parse an empty tag with open and close',
    input: '<span></span>',
    output: 'h("span")',
  },
  {
    message: 'should optimize single child',
    input: `
      <div>
        <span></span>
      </div>
    `,
    output: 'h("div", h("span"))',
  },
  {
    message: 'should optimize text child',
    input: `
      <div>
        Hello world!
      </div>
    `,
    output: 'h("div", "Hello world!")',
  },
  {
    message: 'should optimize text child',
    input: `
      <div>
        Hello world!
      </div>
    `,
    output: 'h("div", "Hello world!")',
  },
  {
    message: 'should escape quotes in text children',
    input: `
      <div>
        Hello " world!
      </div>
    `,
    output: 'h("div", "Hello \" world!")',
  },
  {
    message: 'should parse multiple children',
    input: `
      <div>
        <span></span>
        Hello world!
        <input />
      </div>
    `,
    output: 'h("div", Children {h("span"), h("Hello world!", true), h("input")})',
  },
  {
    message: 'should parse code as child',
    input: `
      <div>
        { function(foo, bar) }
      </div>
    `,
    output: 'h("div", function(foo, bar))',
  },
  {
    message: 'should parse comment as child',
    input: `
      <div>
        { /* comment here */ }
      </div>
    `,
    output: 'h("div")',
  },
  {
    message: 'should parse comment and other children',
    input: `
      <div>
        { /* comment here */ }
        { function(foo, bar) }
        Hello world!
        <input />
      </div>
    `,
    output: 'h("div", Children {function(foo, bar), h("Hello world!", true), h("input")})',
  },
];
