var fs = require('fs');
var path = require('path');
var gccx = require('gccx').default;
// or import gccx from 'gccx';

fs.readdirSync('src').forEach(function(file) {
  if (/\.cpp$/.test(file)) {
    var inputPath = path.join('src', file);
    var outputPath = path.join('compiled', file);
    var code = fs.readFileSync(inputPath, 'utf8');
    var compiled = gccx.parse(code).replace(/REQUIRE_TEMPLATE\("([^"]+)"\)/g, function(match, p1) {
      var templatePath = path.join('src', p1);
      var templateCode = fs.readFileSync(templatePath, 'utf8');
      return gccx.parse(templateCode);
    });
    fs.writeFileSync(outputPath, compiled);
  }
});
