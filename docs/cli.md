## Table of contents

gccx can be used to compile files and directories from the command line

- [Installation](#installation)
- [Compile files](#compile-files)
- [Compile directories](#compile-directories)
- [Usage](#usage)
- [Options](#options)
- [gccxrc](#gccxrc)
- [Examples](#examples)

## Installation

You can install gccx using [npm](https://www.npmjs.com/package/gccx):

```bash
# globally with
npm install -g gccx
# or locally as a dev dependency with
npm install --save-dev gccx
```

## Compile files

Compile the file `component.cpp` and output to stdout.

```bash
gccx file.cpp
# output here
```

If you would like to output to a file you may use `--output` or `-o`.

```bash
gccx file.cpp --output file-compiled.cpp
```

To compile a file every time it changes, use the `--watch` or `-w`:

```bash
gccx file.cpp --watch --output file-compiled.js
```

## Compile directories

Compile the entire `src` directory and output it to the `dist` directory.

```bash
gccx src --output dist
# you can also use --watch
```

## Usage

```bash
gccx [options] <file_or_directory>
```

## Options

| Option   | Default       | Description  |
|----------|---------------|--------------|
| -V, --version |          | output the version number |
| -o, --output <file_or_directory> | | destination file or folder for compiled files |
| -x, --extensions \<extensions> | ".cpx",".CPX",".C",".cc",".cpp",".CPP",".c++",".cp",".cxx" | list of extensions to hook into |
| -i, --ignore \<regex> | | ignore all files and directories that match this regex |
| --no-gccxrc |  | whether or not to look up .gccxrc |
| --no-copy-files |  | when compiling a directory avoid copy over non-compilable files |
| -w, --watch |  | compile files every time that you change them |
| -h, --help | | output usage information |

## gccxrc

Instead of cli options, you can use a `.gccxrc` json file, here is an example:

```json
{
  "output": "dist",
  "extensions": [".cpx", ".CPX", ".C", ".cc", ".cpp", ".CPP", ".c++", ".cp", ".cxx"],
  "ignore": "ignore.cpp",
  "copyFiles": true,
  "watch": true
}
```

gccx will lookup to a `.gccxrc` in the directory of the file being compiled. If one does not exist, it will travel up the directory tree trying to find it.

## Examples

You can find an example of cli usage [here](https://github.com/mbasso/gccx/tree/master/examples/cli).
