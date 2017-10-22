## Table of contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

You can install gccx using [npm](https://www.npmjs.com/package/gccx):

```bash
# as a dev dependency
npm install --save-dev gccx
# or as a dependency
# npm install --save gccx
```

If you aren't using npm in your project, you can include gccx using [unpkg](https://unpkg.com/gccx/) or the UMD build in the dist folder with `<script>` tag. The UMD builds make gccx available as a `window.gccx` global variable.

## Usage

Once you have installed gccx, supposing a CommonJS environment, you can import and immediately use it with no configuration. At the moment it exports an object with a single method `parse(code: string): string`. Here is an example:

```js
import fs from 'fs';
import gccx from 'gccx';

// get code in file as string
const code = fs.readFileSync('file.cpp', 'utf8');
// or you can just assign a string
// const code = '...';

// get the compiled code as string
const compiled = gccx.parse(code);

// log compiled code
console.log(compiled);
// write a file with the code
fs.writeFileSync('compiledFile.cpp', compiled);
```
