export default [
  {
    message: 'should handle an empty input',
    input: [
      '',
      `
           
  
      `,
    ],
    output: ['', ''],
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
    input: ['<foo.bar />', '<foo->bar />', '<foo->bar.baz />'],
    output: ['asmdom::h(foo.bar)', 'asmdom::h(foo->bar)', 'asmdom::h(foo->bar.baz)'],
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
    message: 'should parse fragments',
    input: '<Fragment>   </Fragment>',
    output: 'asmdom::h(u8"")',
  },
  {
    message: 'should parse fragments with children',
    input: `
      < Fragment > 
        { /* comment here */ }
        { function(foo, bar) }
        Hello world!
        <input /> 
      < / Fragment >
    `,
    output: 'asmdom::h(u8"", asmdom::Children {function(foo, bar), asmdom::h(u8"Hello world!", true), asmdom::h(u8"input")})',
  },
  {
    message: 'should support all syntax in comments',
    input:
      '<!-- VNodeChildrenstringreturn-><>/*.-:!={} []()\\"\'0123456789 identifier0123456789 -->',
    output:
      'asmdom::h(u8"!", std::string(u8" VNodeChildrenstringreturn-><>/*.-:!={} []()\\\\"\'0123456789 identifier0123456789 "))',
  },
  {
    message: 'should replace new line and spaces with one space in comments',
    input: `<!-- VNodeChildrenstringreturn-><>/*.-:!={}
        []()\\"'0123456789 identifier0123456789 -->`,
    output:
      'asmdom::h(u8"!", std::string(u8" VNodeChildrenstringreturn-><>/*.-:!={} []()\\\\"\'0123456789 identifier0123456789 "))',
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
    message: 'should support all syntax except {, }, < and > in text child',
    input: `
      <div>
        VNodeChildrenstringreturn-/*.-:!= []()\\"'0123456789 identifier0123456789
      </div>
    `,
    output:
      'asmdom::h(u8"div", std::string(u8"VNodeChildrenstringreturn-/*.-:!= []()\\\\"\'0123456789 identifier0123456789"))',
  },
  {
    message: 'should replace new line and spaces with one space in text child',
    input: `
      <div>
        Hello
        World
      </div>
    `,
    output: 'asmdom::h(u8"div", std::string(u8"Hello World"))',
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
        { function(foo, bar) }
      </div>
    `,
    output: 'asmdom::h(u8"div", function(foo, bar))',
  },
  {
    message: 'should parse code as string',
    input: [
      `
        <div>
          {{ function(foo, bar) }}
        </div>
      `,
      `
        <div>
          Hello { { function(foo, bar) }}
        </div>
      `,
      `
        <div>
          {{ function(foo, bar) }} foo
        </div>
      `,
      `
        <div>
          {{ function(foo, bar) }} {{function(baz)}}
        </div>
      `,
      `
        <div>
          Hello {{ function(foo, bar) }} foo
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
    output:
      'asmdom::h(u8"div", asmdom::Children {function(foo, bar), asmdom::h(u8"Hello world!", true), asmdom::h(u8"input")})',
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
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"data-foo", u8"true"}}))',
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"data-foo", u8"true"}}))',
      'asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"data-foo", emscripten::val(true)}}))',
      'asmdom::h(u8"span", asmdom::Data (asmdom::Callbacks {{u8"data-onclick", onClick}}))',
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
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"data:foo", u8"true"}}))',
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"data:foo", u8"true"}}))',
      'asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"data:foo", emscripten::val(true)}}))',
      'asmdom::h(u8"span", asmdom::Data (asmdom::Callbacks {{u8"data:onclick", onClick}}))',
    ],
  },
  {
    message: 'should parse shorthand attributes',
    input: ['<span foo />', '<span foo></span>', '<span {foo}></span>'],
    output: [
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"true"}}))',
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"true"}}))',
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"true"}}))',
    ],
  },
  {
    message: 'should parse shorthand props',
    input: '<span [foo] />',
    output: 'asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"foo", emscripten::val(true)}}))',
  },
  {
    message: 'should throw if a shorthand callback is provided',
    input: ['<span onFoo />', '<span (onFoo) />'],
    errors: [
      'Error while parsing CPX code at line 0: cannot set callback "onfoo" to "true" using shorthand notation. Maybe you want to use an {attr} or a [prop]?',
      'Error while parsing CPX code at line 0: cannot set callback "onFoo" to "true" using shorthand notation. Maybe you want to use an {attr} or a [prop]?',
    ],
  },
  {
    message: 'should parse string attributes',
    input: ['<span foo="bar" />', '<span {foo}="bar" />'],
    output: [
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"bar"}}))',
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"bar"}}))',
    ],
  },
  {
    message: 'should parse string props',
    input: '<span [foo]="bar" />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"foo", emscripten::val(std::wstring(L"bar"))}}))',
  },
  {
    message: 'should pass props values to emscripten::val constructor',
    input: '<span [foo] [foo]="bar" [bar]={"baz"} />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"foo", emscripten::val(std::wstring(L"bar"))}, {u8"bar", emscripten::val("baz")}}))',
  },
  {
    message: 'should throw if a string callback is provided',
    input: ['<span onFoo="bar" />', '<span (onFoo)="bar" />'],
    errors: [
      'Error while parsing CPX code at line 0: cannot set callback "onfoo" using string notation. Maybe you want to use an {attr}, a [prop] or a (callback)={func}?',
      'Error while parsing CPX code at line 0: cannot set callback "onFoo" using string notation. Maybe you want to use an {attr}, a [prop] or a (callback)={func}?',
    ],
  },
  {
    message: 'should escape double quotes in string attribute',
    input: '<span foo="bar{}<>\'\\"" />',
    output: 'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"bar{}<>\'\\""}}))',
  },
  {
    message: 'should escape single quotes in string attribute',
    input: '<span foo=\'bar{}<>"\\\'\' />',
    output: 'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"bar{}<>"\'"}}))',
  },
  {
    message: 'should escape support all syntax in double quote string attribute',
    input: `<span foo="VNodeChildrenstringreturn-><>/*.-:!={}
        []()\\\\"'0123456789 identifier0123456789" />`,
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"VNodeChildrenstringreturn-><>/*.-:!={} []()\\\\"\'0123456789 identifier0123456789"}}))',
  },
  {
    message: 'should escape support all syntax in single quote string attribute',
    input: `<span foo='VNodeChildrenstringreturn-><>/*.-:!={}
        []()\\"\\'0123456789 identifier0123456789' />`,
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"VNodeChildrenstringreturn-><>/*.-:!={} []()\\"\'0123456789 identifier0123456789"}}))',
  },
  {
    message: 'should recognize value without square brackets',
    input: '<span value="bar" />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"value", emscripten::val(std::wstring(L"bar"))}}))',
  },
  {
    message: 'should recognize checked without square brackets',
    input: '<span checked />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"checked", emscripten::val(true)}}))',
  },
  {
    message: 'should recognize callbacks without round brackets',
    input: '<span onClick={onClick} />',
    output: 'asmdom::h(u8"span", asmdom::Data (asmdom::Callbacks {{u8"onclick", onClick}}))',
  },
  {
    message: 'should recognize ref without round brackets',
    input: '<span ref={refCallback} />',
    output: 'asmdom::h(u8"span", asmdom::Data (asmdom::Callbacks {{u8"ref", refCallback}}))',
  },
  {
    message: 'should parse attributes with spaces',
    input: '<span attr1 { attr2 } = "fooAttr" [ prop ] = "fooProp" ( cb ) = { onClick } />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"attr1", u8"true"}, {u8"attr2", u8"fooAttr"}}, asmdom::Props {{u8"prop", emscripten::val(std::wstring(L"fooProp"))}}, asmdom::Callbacks {{u8"cb", onClick}}))',
  },
  {
    message: 'should parse multiple attributes',
    input: '<span foo="bar" bar="baz" />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"bar"}, {u8"bar", u8"baz"}}))',
  },
  {
    message: 'should parse multiple props',
    input: '<span [foo]="bar" [bar]="baz" />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"foo", emscripten::val(std::wstring(L"bar"))}, {u8"bar", emscripten::val(std::wstring(L"baz"))}}))',
  },
  {
    message: 'should parse multiple props',
    input: '<span [foo]="bar" [bar]="baz" />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"foo", emscripten::val(std::wstring(L"bar"))}, {u8"bar", emscripten::val(std::wstring(L"baz"))}}))',
  },
  {
    message: 'should parse multiple callbacks',
    input: '<span (onfoo)={onFoo} onbar={onBar} />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Callbacks {{u8"onfoo", onFoo}, {u8"onbar", onBar}}))',
  },
  {
    message: 'should parse attributes and props',
    input: '<span foo="bar" [bar]="baz" />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"bar"}}, asmdom::Props {{u8"bar", emscripten::val(std::wstring(L"baz"))}}))',
  },
  {
    message: 'should parse attributes, props and callbacks',
    input: '<span baz="foo" [foo]="bar" (onfoo)={onFoo} />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"baz", u8"foo"}}, asmdom::Props {{u8"foo", emscripten::val(std::wstring(L"bar"))}}, asmdom::Callbacks {{u8"onfoo", onFoo}}))',
  },
  {
    message: 'should parse props and callbacks',
    input: '<span [foo]="bar" (onfoo)={onFoo} />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"foo", emscripten::val(std::wstring(L"bar"))}}, asmdom::Callbacks {{u8"onfoo", onFoo}}))',
  },
  {
    message: 'should parse attributes and callbacks',
    input: '<span foo="bar" (onfoo)={onFoo} />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"bar"}}, asmdom::Callbacks {{u8"onfoo", onFoo}}))',
  },
  {
    message: 'should handle duplicate attributes',
    input: '<span foo foo="bar" bar="baz" />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", u8"bar"}, {u8"bar", u8"baz"}}))',
  },
  {
    message: 'should handle duplicate props',
    input: '<span [foo] [foo]="bar" [bar]="baz" />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Props {{u8"foo", emscripten::val(std::wstring(L"bar"))}, {u8"bar", emscripten::val(std::wstring(L"baz"))}}))',
  },
  {
    message: 'should handle duplicate callbacks',
    input: '<span (onfoo)={onBaz} (onfoo)={onFoo} onbar={onBar} />',
    output:
      'asmdom::h(u8"span", asmdom::Data (asmdom::Callbacks {{u8"onfoo", onFoo}, {u8"onbar", onBar}}))',
  },
  {
    message: 'should parse children code as child',
    input: `
      <div>
        { ... foo }
      </div>
    `,
    output: 'asmdom::h(u8"div", foo)',
  },
  {
    message: 'should parse children code as last child',
    input: `
      <div>
        text
        <span>text</span>
        { ... foo }
      </div>
    `,
    output:
      'asmdom::h(u8"div", [&]() -> asmdom::Children {asmdom::Children _asmdom_ch_concat_0;asmdom::Children _asmdom_ch_concat_1 = asmdom::Children {asmdom::h(u8"text", true), asmdom::h(u8"span", std::string(u8"text"))};asmdom::Children _asmdom_ch_concat_2 = foo;_asmdom_ch_concat_0.reserve(_asmdom_ch_concat_1.size() + _asmdom_ch_concat_2.size());_asmdom_ch_concat_0.insert(_asmdom_ch_concat_0.end(), _asmdom_ch_concat_1.begin(), _asmdom_ch_concat_1.end());_asmdom_ch_concat_0.insert(_asmdom_ch_concat_0.end(), _asmdom_ch_concat_2.begin(), _asmdom_ch_concat_2.end());return _asmdom_ch_concat_0;}())',
  },
  {
    message: 'should parse children code as first child',
    input: `
      <div>
        { ... foo }
        text
        <span>text</span>
      </div>
    `,
    output:
      'asmdom::h(u8"div", [&]() -> asmdom::Children {asmdom::Children _asmdom_ch_concat_3;asmdom::Children _asmdom_ch_concat_4 = foo;asmdom::Children _asmdom_ch_concat_5 = asmdom::Children {asmdom::h(u8"text", true), asmdom::h(u8"span", std::string(u8"text"))};_asmdom_ch_concat_3.reserve(_asmdom_ch_concat_4.size() + _asmdom_ch_concat_5.size());_asmdom_ch_concat_3.insert(_asmdom_ch_concat_3.end(), _asmdom_ch_concat_4.begin(), _asmdom_ch_concat_4.end());_asmdom_ch_concat_3.insert(_asmdom_ch_concat_3.end(), _asmdom_ch_concat_5.begin(), _asmdom_ch_concat_5.end());return _asmdom_ch_concat_3;}())',
  },
  {
    message: 'should parse multiple children code',
    input: [
      `
        <div>
          {... foo }
          { ... bar }
        </div>
      `,
      `
        <div>
          text
          {...foo }
          <span />
          { ... bar }
        </div>
      `,
    ],
    output: [
      'asmdom::h(u8"div", [&]() -> asmdom::Children {asmdom::Children _asmdom_ch_concat_6;asmdom::Children _asmdom_ch_concat_7 = foo;asmdom::Children _asmdom_ch_concat_8 = bar;_asmdom_ch_concat_6.reserve(_asmdom_ch_concat_7.size() + _asmdom_ch_concat_8.size());_asmdom_ch_concat_6.insert(_asmdom_ch_concat_6.end(), _asmdom_ch_concat_7.begin(), _asmdom_ch_concat_7.end());_asmdom_ch_concat_6.insert(_asmdom_ch_concat_6.end(), _asmdom_ch_concat_8.begin(), _asmdom_ch_concat_8.end());return _asmdom_ch_concat_6;}())',
      'asmdom::h(u8"div", [&]() -> asmdom::Children {asmdom::Children _asmdom_ch_concat_9;asmdom::Children _asmdom_ch_concat_10 = asmdom::Children {asmdom::h(u8"text", true)};asmdom::Children _asmdom_ch_concat_11 = foo;asmdom::Children _asmdom_ch_concat_12 = asmdom::Children {asmdom::h(u8"span")};asmdom::Children _asmdom_ch_concat_13 = bar;_asmdom_ch_concat_9.reserve(_asmdom_ch_concat_10.size() + _asmdom_ch_concat_11.size() + _asmdom_ch_concat_12.size() + _asmdom_ch_concat_13.size());_asmdom_ch_concat_9.insert(_asmdom_ch_concat_9.end(), _asmdom_ch_concat_10.begin(), _asmdom_ch_concat_10.end());_asmdom_ch_concat_9.insert(_asmdom_ch_concat_9.end(), _asmdom_ch_concat_11.begin(), _asmdom_ch_concat_11.end());_asmdom_ch_concat_9.insert(_asmdom_ch_concat_9.end(), _asmdom_ch_concat_12.begin(), _asmdom_ch_concat_12.end());_asmdom_ch_concat_9.insert(_asmdom_ch_concat_9.end(), _asmdom_ch_concat_13.begin(), _asmdom_ch_concat_13.end());return _asmdom_ch_concat_9;}())',
    ],
  },
  {
    message: 'should parse CPX code inside C++ code',
    input: `
      // my first program in C++
      #include <iostream>

      int main()
      {
        VNode* vnode = <span />;
      }
    `,
    output: `// my first program in C++
      #include <iostream>

      int main()
      {
        VNode* vnode = asmdom::h(u8"span");
      }`,
  },
  {
    message: 'should parse CPX code inside children',
    input: `
      <span>
        { [&]() -> VNode* {
          return (
            <div />
          );
        }() }
      </span>
    `,
    output: `asmdom::h(u8\"span\", [&]() -> VNode* {
          return (
            asmdom::h(u8\"div\")
          );
        }())`,
  },
  {
    message: 'should parse CPX code inside attributes',
    input: `
      <span foo={[&]() -> std::string {
        VNode* vnode = (
          <div />
        );
        return "bar";
      }} />
    `,
    output: `asmdom::h(u8"span", asmdom::Data (asmdom::Attrs {{u8"foo", [&]() -> std::string {
        VNode* vnode = (
          asmdom::h(u8\"div\")
        );
        return "bar";
      }}}))`,
  },
  {
    message: 'should parse only spread operator',
    input: '<span {...data} />',
    output: 'asmdom::h(u8"span", data)',
  },
  {
    message: 'should parse spread operator with spaces',
    input: '<span {  ...   data   } />',
    output: 'asmdom::h(u8"span", data)',
  },
  {
    message: 'should parse spread operator as last attribute',
    input: '<span foo bar {...data} />',
    output:
      'asmdom::h(u8"span", [&]() -> asmdom::Data {asmdom::Data _asmdom_data_concat_0;asmdom::Data _asmdom_data_concat_1 = asmdom::Data (asmdom::Attrs {{u8"foo", u8"true"}, {u8"bar", u8"true"}});asmdom::Data _asmdom_data_concat_2 = data;_asmdom_data_concat_0.attrs.insert(_asmdom_data_concat_2.attrs.begin(), _asmdom_data_concat_2.attrs.end());_asmdom_data_concat_0.props.insert(_asmdom_data_concat_2.props.begin(), _asmdom_data_concat_2.props.end());_asmdom_data_concat_0.callbacks.insert(_asmdom_data_concat_2.callbacks.begin(), _asmdom_data_concat_2.callbacks.end());_asmdom_data_concat_0.attrs.insert(_asmdom_data_concat_1.attrs.begin(), _asmdom_data_concat_1.attrs.end());_asmdom_data_concat_0.props.insert(_asmdom_data_concat_1.props.begin(), _asmdom_data_concat_1.props.end());_asmdom_data_concat_0.callbacks.insert(_asmdom_data_concat_1.callbacks.begin(), _asmdom_data_concat_1.callbacks.end());return _asmdom_data_concat_0;}())',
  },
  {
    message: 'should parse spread operator as first attribute',
    input: '<span {...data} foo bar />',
    output:
      'asmdom::h(u8"span", [&]() -> asmdom::Data {asmdom::Data _asmdom_data_concat_3;asmdom::Data _asmdom_data_concat_4 = data;asmdom::Data _asmdom_data_concat_5 = asmdom::Data (asmdom::Attrs {{u8"foo", u8"true"}, {u8"bar", u8"true"}});_asmdom_data_concat_3.attrs.insert(_asmdom_data_concat_5.attrs.begin(), _asmdom_data_concat_5.attrs.end());_asmdom_data_concat_3.props.insert(_asmdom_data_concat_5.props.begin(), _asmdom_data_concat_5.props.end());_asmdom_data_concat_3.callbacks.insert(_asmdom_data_concat_5.callbacks.begin(), _asmdom_data_concat_5.callbacks.end());_asmdom_data_concat_3.attrs.insert(_asmdom_data_concat_4.attrs.begin(), _asmdom_data_concat_4.attrs.end());_asmdom_data_concat_3.props.insert(_asmdom_data_concat_4.props.begin(), _asmdom_data_concat_4.props.end());_asmdom_data_concat_3.callbacks.insert(_asmdom_data_concat_4.callbacks.begin(), _asmdom_data_concat_4.callbacks.end());return _asmdom_data_concat_3;}())',
  },
  {
    message: 'should parse multiple spread attributes',
    input: ['<span {...foo} {...bar} />', '<span foo {...foo} bar {...bar} />'],
    output: [
      'asmdom::h(u8"span", [&]() -> asmdom::Data {asmdom::Data _asmdom_data_concat_6;asmdom::Data _asmdom_data_concat_7 = foo;asmdom::Data _asmdom_data_concat_8 = bar;_asmdom_data_concat_6.attrs.insert(_asmdom_data_concat_8.attrs.begin(), _asmdom_data_concat_8.attrs.end());_asmdom_data_concat_6.props.insert(_asmdom_data_concat_8.props.begin(), _asmdom_data_concat_8.props.end());_asmdom_data_concat_6.callbacks.insert(_asmdom_data_concat_8.callbacks.begin(), _asmdom_data_concat_8.callbacks.end());_asmdom_data_concat_6.attrs.insert(_asmdom_data_concat_7.attrs.begin(), _asmdom_data_concat_7.attrs.end());_asmdom_data_concat_6.props.insert(_asmdom_data_concat_7.props.begin(), _asmdom_data_concat_7.props.end());_asmdom_data_concat_6.callbacks.insert(_asmdom_data_concat_7.callbacks.begin(), _asmdom_data_concat_7.callbacks.end());return _asmdom_data_concat_6;}())',
      'asmdom::h(u8"span", [&]() -> asmdom::Data {asmdom::Data _asmdom_data_concat_9;asmdom::Data _asmdom_data_concat_10 = asmdom::Data (asmdom::Attrs {{u8"foo", u8"true"}});asmdom::Data _asmdom_data_concat_11 = foo;asmdom::Data _asmdom_data_concat_12 = asmdom::Data (asmdom::Attrs {{u8"bar", u8"true"}});asmdom::Data _asmdom_data_concat_13 = bar;_asmdom_data_concat_9.attrs.insert(_asmdom_data_concat_13.attrs.begin(), _asmdom_data_concat_13.attrs.end());_asmdom_data_concat_9.props.insert(_asmdom_data_concat_13.props.begin(), _asmdom_data_concat_13.props.end());_asmdom_data_concat_9.callbacks.insert(_asmdom_data_concat_13.callbacks.begin(), _asmdom_data_concat_13.callbacks.end());_asmdom_data_concat_9.attrs.insert(_asmdom_data_concat_12.attrs.begin(), _asmdom_data_concat_12.attrs.end());_asmdom_data_concat_9.props.insert(_asmdom_data_concat_12.props.begin(), _asmdom_data_concat_12.props.end());_asmdom_data_concat_9.callbacks.insert(_asmdom_data_concat_12.callbacks.begin(), _asmdom_data_concat_12.callbacks.end());_asmdom_data_concat_9.attrs.insert(_asmdom_data_concat_11.attrs.begin(), _asmdom_data_concat_11.attrs.end());_asmdom_data_concat_9.props.insert(_asmdom_data_concat_11.props.begin(), _asmdom_data_concat_11.props.end());_asmdom_data_concat_9.callbacks.insert(_asmdom_data_concat_11.callbacks.begin(), _asmdom_data_concat_11.callbacks.end());_asmdom_data_concat_9.attrs.insert(_asmdom_data_concat_10.attrs.begin(), _asmdom_data_concat_10.attrs.end());_asmdom_data_concat_9.props.insert(_asmdom_data_concat_10.props.begin(), _asmdom_data_concat_10.props.end());_asmdom_data_concat_9.callbacks.insert(_asmdom_data_concat_10.callbacks.begin(), _asmdom_data_concat_10.callbacks.end());return _asmdom_data_concat_9;}())',
    ],
  },
  {
    message: 'should escape C++ code',
    input: [
      `
        #include <iostream>
        
        int main()
        {
          std::string foo = "<span />";
          VNode* vnode = <span />;
        }
      `,
      `
        #include <iostream>
        
        int main()
        {
          std::string foo = " VNodeChildrenstringreturn-><>/*.-:!={} []()\\"'0123456789 identifier0123456789 '";
          VNode* vnode = <span />;
        }
      `,
      `
        #include <iostream>
        #include <string>
        #include <map>
        
        int main()
        {
          std::map<int, VNode*> foo {
              {0, <span />},
              {2, <span />},
              {4, <span />}
          };
          std::vector<std::map<int, VNode*>> bar;
          VNode* vnode = <span />;
        }
      `,
      `
        #include <iostream>
        #include <string>
        #include <map>
        
        int main()
        {
          int foo = 0xF0;
          
          foo >>= 4;
          foo <<= 2;
          foo >> 2;
          foo << 2;
          foo<< 2;
          4 >>= foo;
          2 <<= foo;
          2 >> foo;
          2 << foo;
          2<< foo;
          std::cout << foo << 8;
          std::cout<< foo << 8;
          VNode* vnode = <span />;
        }
      `,
      `
        #include <iostream>
        
        VNode* main()
        {
          return <span />;
        }
      `,
      `
        #include <iostream>
        
        int main()
        {
          int foo = 2;
          int bar = 3;
          if (foo < 4 || 4 < foo) {
            bar = foo > bar ? 5 : foo++;
          } else if (foo > 6 || 6 < foo) {
            bar = foo < bar ? 5 : foo--;
          } else if (foo<bar || bar>foo || 4<5 || 5>4) {
            bar = 7;
          }
          VNode* vnode = <span />;
        }
      `,
      `
        template<class T1> struct bar
        {
          void doStuff() { std::cout << ""; }
        };

        template<>
        struct bar<int>
        {
        void doStuff() { std::cout << ""; }
        };
      `,
      'friend bool operator==<>(ValueIter<Type> const &rhs, ValueIter<Type> const &lhs);',
    ],
    output: [
      `#include <iostream>
        
        int main()
        {
          std::string foo = "<span />";
          VNode* vnode = asmdom::h(u8"span");
        }`,
      `#include <iostream>
        
        int main()
        {
          std::string foo = " VNodeChildrenstringreturn-><>/*.-:!={} []()\\"'0123456789 identifier0123456789 '";
          VNode* vnode = asmdom::h(u8"span");
        }`,
      `#include <iostream>
        #include <string>
        #include <map>
        
        int main()
        {
          std::map<int, VNode*> foo {
              {0, asmdom::h(u8"span")},
              {2, asmdom::h(u8"span")},
              {4, asmdom::h(u8"span")}
          };
          std::vector<std::map<int, VNode*>> bar;
          VNode* vnode = asmdom::h(u8"span");
        }`,
      `#include <iostream>
        #include <string>
        #include <map>
        
        int main()
        {
          int foo = 0xF0;
          
          foo >>= 4;
          foo <<= 2;
          foo >> 2;
          foo << 2;
          foo<< 2;
          4 >>= foo;
          2 <<= foo;
          2 >> foo;
          2 << foo;
          2<< foo;
          std::cout << foo << 8;
          std::cout<< foo << 8;
          VNode* vnode = asmdom::h(u8"span");
        }`,
      `#include <iostream>
        
        VNode* main()
        {
          return asmdom::h(u8"span");
        }`,
      `#include <iostream>
        
        int main()
        {
          int foo = 2;
          int bar = 3;
          if (foo < 4 || 4 < foo) {
            bar = foo > bar ? 5 : foo++;
          } else if (foo > 6 || 6 < foo) {
            bar = foo < bar ? 5 : foo--;
          } else if (foo<bar || bar>foo || 4<5 || 5>4) {
            bar = 7;
          }
          VNode* vnode = asmdom::h(u8"span");
        }`,
      `template<class T1> struct bar
        {
          void doStuff() { std::cout << ""; }
        };

        template<>
        struct bar<int>
        {
        void doStuff() { std::cout << ""; }
        };`,
        'friend bool operator==<>(ValueIter<Type> const &rhs, ValueIter<Type> const &lhs);',
    ],
  },
];
