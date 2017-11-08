## Table of contents

- [Introduction](#introduction)
	- [CPX represents objects](#cpx-represents-objects)
	- [Scope](#scope)
- [Elements](#elements)
- [Tag attributes](#tag-attributes)
	- [Attributes](#attributes)
	- [Props](#props)
	- [Callbacks](#callbacks)
	- [Default to true](#default-to-true)
	- [Spread attributes](#spread-attributes)
- [Children](#children)
	- [Expressions as children](#expressions-as-children)
		- [Strings](#strings)
		- [VNode](#vnode)
		- [Children](#children)
	- [NULL children](#null-children)
- [Comments](#comments)


## Introduction

As we said in the previous section, `gccx` compiles `CPX` into standard C++. This means that `gccx` will compile everything that respects `CPX` syntax, it will not check the validity of your program, it will not warn you about undefined variables, wrong types and so on. You will catch these errors only when you decide to compile your C++ code using [emcc](http://kripken.github.io/emscripten-site/).
Using `gccx` you can compile files that embed some `CPX` code, but also file that contains only `CPX` code, for example you can parse this:

```js
#include "../path-to-asm-dom/asm-dom.hpp"
#include <string>
#include <emscripten/val.h>

int main() {
  asmdom::VNode* image = <img src="hello.png" />;
}
```

or only this:

```js
<img src="hello.png" />
```

Please read carefully this document to understand the syntactic differences from `JSX`. These differences are necessary because C++ is a weakly typed language while Javascript is a dynamically typed language.

### CPX represents objects

`CPX` code compiles into calls to `asmdom::h`, this means that a `CPX` expression always returns an `asmdom::VNode*`, for this reason, you can do:

```js
asmdom::VNode* image = <img src="hello.png" />;

// is equal to
/*
asmdom::VNode* image = asmdom::h(u8"img",
  asmdom::Data (
    asmdom::Attrs {
      {u8"src", u8"hello.png"}
    }
  )
);
*/
```

### Scope

Since `CPX` compiles into calls to `asmdom::h`, the `asm-dom.h` must always be on top of the interested file. Consider also that `asmdom` uses `std::string` and `emscripten::val`, defined in `<string>` and `<emscripten/val.h>`.

```c++
#include "../path-to-asm-dom/asm-dom.hpp"
#include <string>
#include <emscripten/val.h>

// code...
```

## Elements

To create a VNode, you can simply write a tag as you do in XML:

```js
<img src="hello.png" />
```

If you want to dynamically choose a tag of an element, you can use `->` and `.` operators on your vars:

```
<foo.bar->baz src="hello.png" />
```

## Tag attributes

Attributes (attributes, props, and callbacks) can be set as string literals with double quotes just like in XML:

```js
<img src="hello.png" />
```

or you can assign an expression inside curly brackets:

```js
// std::string filename = "hello";
// std::string extension = "png";

<img src={filename + "." + extension} />
```

Differently from JSX, you can set any attribute just like in html, you don't have to use for example `className` or camel case identifiers:

```js
// in JSX:
<div className="css-class" tabIndex="0" />

// in CPX:
<div class="css-class" tabindex="0" />
```

### Attributes

Attributes corresponds to [`asmdom::Attrs`](https://github.com/mbasso/asm-dom/blob/master/docs/cpp.md#h), they are `std::string` and are set using `domNode.setAttribute(attr, val)`. Here is the syntax:

```
<image
  attribute="this is an attribute"
  class="css-class"
  data-id="foo" // dataset attribute
  xlink:href="link" // namespaced attribute
/>
```

However there are some special identifiers that are automatically interpreted as props like `value` or `checked`. This is particularly convenient to avoid a code like `<input [value]={variable} />` every time.
In addition, every attribute that starts with `on` is automatically interpreted as callbacks and rendered lowercase, for example:

```
<button onClick={callback} />

// is equal to

<button (onclick)={callback}>
```

If you want to declare an attribute that stars with `on`, `value` or `checked`, so, you want to ignore these rules, you can surround it with curly brackets:

```
<button onClick={callback} /> // this is an "onclick" callback
<button {onClick}="callback" /> // this is an "onClick" attribute
```

### Props

Props corresponds to [`asmdom::Props`](https://github.com/mbasso/asm-dom/blob/master/docs/cpp.md#h), they are [`emscripten::val`](https://kripken.github.io/emscripten-site/docs/api_reference/val.h.html) and are set using the dot notation `node.prop = val`. You can specify that an attribute is a prop surrounding it with square brackets:

```
<div
  attribute="this is a attribute"
  [prop]="this is a prop"
/>
```

Using gccx you don't have to care about the type, values are automatically passed to `emscripten::val` constructor, so, you can do something like this:

```
// you can provide any type:
// int foo = 7;

// or emscripten::val
// emscripten::val bar = emscripten::val::undefined();

<div
  [foo]={foo}
  [bar]={bar}
/>
```

### Callbacks

Callbacks corresponds to [`asmdom::Callbacks`](https://github.com/mbasso/asm-dom/blob/master/docs/cpp.md#h) and they are `std::function<bool(emscripten::val)>`. You can specify that an attribute is a callback surrounding it with parens:

```
<button (onclick)={handler} />
```

You can provide to callbacks a `std::function<bool(emscripten::val)>`, a pointer to a function or a lambda:

```
/*
bool onChange(emscripten::val event) {
	// do stuff...
	return true;
};
*/

<input
  (onchange)={onChange}
  (onkeydown)={[&](emscripten::val e) -> bool {
    // do stuff...
    return false;
  }}
/>
```

### Default to true

If you pass no value for an attribute or a prop, it defaults to true:

```
<input [booleanVal] readonly>
// is equal to
<input [booleanVal]={true} readonly="true">

// falsy values can be used as follows:
<input [booleanVal]={false} readonly="false">
```

### Spread attributes

If you already have an `asmdom::Data` object, and you want to pass it in `CPX`, you can use `...` as a `spread` operator to pass the whole object:

```js
/*
asmdom::Data data(
  Attrs {
    {"class", "css-class"},
    {"style", "font-weight: bold"}
  }
)
*/

<div attribute="foo" {...data} />
// is equal to
<div attribute="foo" class="css-class" style="font-weight: bold" />

// you can overwrite values in spread putting them after it
<div attribute="foo" {...data} class="another-css-class"/>
// <div attribute="foo" style="font-weight: bold" class="another-css-class" />
```

## Children

If a tag is empty, you can close it with `/>`, like XML:

```js
<div />
```

otherwise, it can contains children:

```js
<div>
  <h1>Hello World!</h1>
  <img src="hello.png" />
  This is a text
</div>
```

### Expressions as children

You can also embed expressions in children, these expressions can produce `std::string`, `asmdom::VNode` or `asmdom::Children`.

#### Strings

`std::string` can be embed using double curly brackets:

```js
// std::string name = "foo";

<div>
  <h1>Hello {{ name }}!</h1>
</div>
```

#### VNode

`asmdom::VNode` can be embed using single curly brackets:

```js
/*
asmdom::VNode getImg(std::string src) {
  return <img src={src} />;
};
*/

<div>
  <h1>Hello World!</h1>
  { getImg("hello.png") }
</div>
```

#### Children

`asmdom::Children` can be embed using `{...expression}`:

```js
/*
asmdom::Children getVNodes(std::string src) {
  return asmdom::Children {
    <img src={src} />,
    <div>Rendering {{ src }}</div>
  };
};
*/

<div>
  <h1>Hello World!</h1>
  {...getVNodes("hello.png")}
</div>
```

### NULL children

If you want to conditionally render something, `CPX` accepts `NULL` values:

```js
// std::string name = "foo";
<div>
  <h1>Hello World!</h1>
  { name === "foo" ? <h2>Hi Foo!</h2> : NULL }
</div>
```

## Comments

Comments can be written just like in JSX as follows:

```js
<div>
  { /* I'm a comment */}
  Hello World!
</div>
```

In this way the comment is deleted at compile time and not rendered.

If you want to render a comment into the DOM, you can do something like:

```
<div>
  <!-- I'll be rendered! -->
  Hello World!
</div>
```
