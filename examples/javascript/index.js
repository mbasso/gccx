var fs = require('fs');
var path = require('path');
var gccx = require('gccx').default;
// or import gccx from 'gccx';

fs.readdirSync('src').forEach(function(file) {
  var inputPath = path.join('src', file);
  var outputPath = path.join('compiled', file);
  var code = fs.readFileSync(inputPath, 'utf8');
  var compiled = gccx.parse(code);
  fs.writeFileSync(outputPath, compiled);
});
