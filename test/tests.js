export default [
  {
    message: 'should handle an empty input',
    input: [
      '',
      `
           
  
      `,
    ],
    output: [
      '',
      '',
    ],
  },
  {
    message: 'should handle an empty input',
    input: '',
    output: '',
  },
  {
    message: 'should handle non trimmed input',
    input: `
        <span />   
         
    `,
    output: 'asmdom::h(u8"span")',
  },
  {
    message: 'should parse self closing tags with spaces',
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
    message: 'should support member expressions selectors',
    input: [
      '<foo.bar />',
      '<foo->bar />',
      '<foo->bar.baz />',
    ],
    output: [
      'asmdom::h(foo.bar)',
      'asmdom::h(foo->bar)',
      'asmdom::h(foo->bar.baz)',
    ],
  },
  {
    message: 'should parse comments',
    input: '<!-- Hello world! -->',
    output: 'asmdom::h(u8"!", std::string(u8" Hello world! "))',
  },
  {
    message: 'should escape quotes in comments',
    input: '<!-- Hello " world! -->',
    output: 'asmdom::h(u8"!", std::string(u8" Hello \\" world! "))',
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
    output: 'asmdom::h(u8"div", std::string(u8"Hello \\" world!"))',
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
          {:string function(foo, bar)} foo
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
  {
    message: 'should parse dashed attributes',
    input: [
      '<span data-foo />',
      '<span {data-foo} />',
      '<span [data-foo]></span>',
      '<span (data-onclick)={onClick}></span>',
    ],
    output: [
      'asmdom::h(u8"span", Data (Attrs {{u8"data-foo", u8"true"}}))',
      'asmdom::h(u8"span", Data (Attrs {{u8"data-foo", u8"true"}}))',
      'asmdom::h(u8"span", Data (Props {{u8"data-foo", emscripten::val(true)}}))',
      'asmdom::h(u8"span", Data (Callbacks {{u8"data-onclick", onClick}}))',
    ],
  },
  {
    message: 'should parse namespaced attributes',
    input: [
      '<span data:foo />',
      '<span {data:foo} />',
      '<span [data:foo]></span>',
      '<span (data:onclick)={onClick}></span>',
    ],
    output: [
      'asmdom::h(u8"span", Data (Attrs {{u8"data:foo", u8"true"}}))',
      'asmdom::h(u8"span", Data (Attrs {{u8"data:foo", u8"true"}}))',
      'asmdom::h(u8"span", Data (Props {{u8"data:foo", emscripten::val(true)}}))',
      'asmdom::h(u8"span", Data (Callbacks {{u8"data:onclick", onClick}}))',
    ],
  },
  {
    message: 'should parse shorthand attributes',
    input: [
      '<span foo />',
      '<span foo></span>',
      '<span {foo}></span>',
    ],
    output: [
      'asmdom::h(u8"span", Data (Attrs {{u8"foo", u8"true"}}))',
      'asmdom::h(u8"span", Data (Attrs {{u8"foo", u8"true"}}))',
      'asmdom::h(u8"span", Data (Attrs {{u8"foo", u8"true"}}))',
    ],
  },
  {
    message: 'should parse shorthand props',
    input: '<span [foo] />',
    output: 'asmdom::h(u8"span", Data (Props {{u8"foo", emscripten::val(true)}}))',
  },
  {
    message: 'should throw if a shorthand callback is provided',
    input: [
      '<span onFoo />',
      '<span (onFoo) />',
    ],
    errors: [
      'Error while parsing CPX code at line 0: cannot set callback "onfoo" to "true" using shorthand notation. Maybe you want to use an {attr} or a [prop]?',
      'Error while parsing CPX code at line 0: cannot set callback "onFoo" to "true" using shorthand notation. Maybe you want to use an {attr} or a [prop]?',
    ],
  },
  {
    message: 'should parse string attributes',
    input: [
      '<span foo="bar" />',
      '<span {foo}="bar" />',
    ],
    output: [
      'asmdom::h(u8"span", Data (Attrs {{u8"foo", u8"bar"}}))',
      'asmdom::h(u8"span", Data (Attrs {{u8"foo", u8"bar"}}))',
    ],
  },
  {
    message: 'should parse string props',
    input: '<span [foo]="bar" />',
    output: 'asmdom::h(u8"span", Data (Props {{u8"foo", emscripten::val(L"bar")}}))',
  },
  {
    message: 'should throw if a string callback is provided',
    input: [
      '<span onFoo="bar" />',
      '<span (onFoo)="bar" />',
    ],
    errors: [
      'Error while parsing CPX code at line 0: cannot set callback "onfoo" using string notation. Maybe you want to use an {attr}, a [prop] or a (callback)={func}?',
      'Error while parsing CPX code at line 0: cannot set callback "onFoo" using string notation. Maybe you want to use an {attr}, a [prop] or a (callback)={func}?',
    ],
  },
  {
    message: 'should escape quotes in string attribute',
    input: '<span foo="bar{}<>\\"" />',
    output: 'asmdom::h(u8"span", Data (Attrs {{u8"foo", u8"bar{}<>\\""}}))',
  },
  {
    message: 'should recognize value without square brackets',
    input: '<span value="bar" />',
    output: 'asmdom::h(u8"span", Data (Props {{u8"value", emscripten::val(L"bar")}}))',
  },
  {
    message: 'should recognize checked without square brackets',
    input: '<span checked />',
    output: 'asmdom::h(u8"span", Data (Props {{u8"checked", emscripten::val(true)}}))',
  },
  {
    message: 'should recognize callbacks without round brackets',
    input: '<span onClick={onClick} />',
    output: 'asmdom::h(u8"span", Data (Callbacks {{u8"onclick", onClick}}))',
  },
  {
    message: 'should parse attributes with spaces',
    input: '<span attr1 { attr2 } = "fooAttr" [ prop ] = "fooProp" ( cb ) = { onClick } />',
    output: 'asmdom::h(u8"span", Data (Attrs {{u8"attr1", u8"true"}, {u8"attr2", u8"fooAttr"}}, Props {{u8"prop", emscripten::val(L"fooProp")}}, Callbacks {{u8"cb", onClick}}))',
  },
  {
    message: 'should parse multiple attributes',
    input: '<span foo="bar" bar="baz" />',
    output: 'asmdom::h(u8"span", Data (Attrs {{u8"foo", u8"bar"}, {u8"bar", u8"baz"}}))',
  },
  {
    message: 'should parse multiple props',
    input: '<span [foo]="bar" [bar]="baz" />',
    output: 'asmdom::h(u8"span", Data (Props {{u8"foo", emscripten::val(L"bar")}, {u8"bar", emscripten::val(L"baz")}}))',
  },
  {
    message: 'should parse multiple props',
    input: '<span [foo]="bar" [bar]="baz" />',
    output: 'asmdom::h(u8"span", Data (Props {{u8"foo", emscripten::val(L"bar")}, {u8"bar", emscripten::val(L"baz")}}))',
  },
  {
    message: 'should parse multiple callbacks',
    input: '<span (onfoo)={onFoo} onbar={onBar} />',
    output: 'asmdom::h(u8"span", Data (Callbacks {{u8"onfoo", onFoo}, {u8"onbar", onBar}}))',
  },
  {
    message: 'should parse attributes and props',
    input: '<span foo="bar" [bar]="baz" />',
    output: 'asmdom::h(u8"span", Data (Attrs {{u8"foo", u8"bar"}}, Props {{u8"bar", emscripten::val(L"baz")}}))',
  },
  {
    message: 'should parse attributes, props and callbacks',
    input: '<span baz="foo" [foo]="bar" (onfoo)={onFoo} />',
    output: 'asmdom::h(u8"span", Data (Attrs {{u8"baz", u8"foo"}}, Props {{u8"foo", emscripten::val(L"bar")}}, Callbacks {{u8"onfoo", onFoo}}))',
  },
  {
    message: 'should parse props and callbacks',
    input: '<span [foo]="bar" (onfoo)={onFoo} />',
    output: 'asmdom::h(u8"span", Data (Props {{u8"foo", emscripten::val(L"bar")}}, Callbacks {{u8"onfoo", onFoo}}))',
  },
  {
    message: 'should parse attributes and callbacks',
    input: '<span foo="bar" (onfoo)={onFoo} />',
    output: 'asmdom::h(u8"span", Data (Attrs {{u8"foo", u8"bar"}}, Callbacks {{u8"onfoo", onFoo}}))',
  },
  {
    message: 'should handle duplicate attributes',
    input: '<span foo foo="bar" bar="baz" />',
    output: 'asmdom::h(u8"span", Data (Attrs {{u8"foo", u8"bar"}, {u8"bar", u8"baz"}}))',
  },
  {
    message: 'should handle duplicate props',
    input: '<span [foo] [foo]="bar" [bar]="baz" />',
    output: 'asmdom::h(u8"span", Data (Props {{u8"foo", emscripten::val(L"bar")}, {u8"bar", emscripten::val(L"baz")}}))',
  },
  {
    message: 'should handle duplicate callbacks',
    input: '<span (onfoo)={onBaz} (onfoo)={onFoo} onbar={onBar} />',
    output: 'asmdom::h(u8"span", Data (Callbacks {{u8"onfoo", onFoo}, {u8"onbar", onBar}}))',
  },
];
