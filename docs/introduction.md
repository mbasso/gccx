## Table of contents

- [Motivation](#motivation)
- [Introduction](#introduction)
- [Differences from JSX](#differences-from-jsx)

## Motivation

[asm-dom](https://github.com/mbasso/asm-dom) Virtual DOM is a little bit verbose to write, we need a lot, not to much readable, lines of code to create a view. In addition we have to convert some types, merge attributes, props and do other stuff like that every time. For this reason we have decided to create `gccx`, a parser that allows us to write a new simple syntax. We will call this syntax `CPX`, it is based on [JSX](https://facebook.github.io/jsx/) but it has some differences. Basically `gccx` will transform this syntax into standard C++. In this way we can write files that appear very similar to HTML and can be written and read easily.

## Introduction

As we said before `gccx` compiles `CPX` into standard C++. This means that `gccx` will compile everything that respects `CPX` syntax, it will not check the validity of your program, it will not warn you about undefined variables, wrong types and so on. You will catch these errors only when you decide to compile your C++ code using [emcc](http://kripken.github.io/emscripten-site/).

## Differences from JSX

`CPX` is based on [JSX](https://facebook.github.io/jsx/), so they are very similar, however there are some important differences. This is mainly because C++ is a weakly typed language while Javascript is a dynamically typed language.
For this reason you have to pay attention to a set of syntactic rules, for example, you have to write children in different ways, as shown here:

```
// In JSX
// name: string
// getVNode: () => VNode
// children: Array<VNode>
<div>
  Hello { name } !
  { getVNode() }
  { children }
</div>

// In CPX
// name: std::string
// getVNode: asmdom::VNode (*getVNode)()
// children: asmdom::Children
<div>
  Hello {{ name }} !
  { getVNode() }
  { ...children }
</div>
```

Also, attributes can only be `std::string`, props `emscripten::val` and callbacks `std::function<bool(emscripten::val)>`. `gccx` will help you automatically converting some values but, please, read carefully the doc to avoid some errors. You will find a detailed explaination in the next section.
