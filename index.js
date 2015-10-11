var path = require('path');
var vo = require('vo');
var _ = require('lodash');
var Nightmare = require('nightmare');

var css = path.join(__dirname, 'index.css');
 
module.exports = function(argv) {
  "use strict";

  const file = path.join(process.cwd(), argv._[0]),
        extension = path.extname(file),
        base = file.replace(extension, '');

  const nightmare = Nightmare();

  vo(function *() {
    // load the file
    yield nightmare
      .goto(`file://${file}`)
      .inject('css', css)
      .exists('body');

    // pull out describe blocks
    var describes = yield nightmare.evaluate(function() {
        return Array.prototype.map.call(document.querySelectorAll('describe'), function(element) {
          return {
            title: element.title,
            x: element.offsetLeft,
            y: element.offsetTop,
            width: element.offsetWidth,
            height: element.offsetHeight
          };
        });
      });

    // render each block
    for (var i = 0; i < describes.length; i++) {
      let describe = describes[i],
          title = _.kebabCase(describe.title) || i;
      yield nightmare.screenshot(`${base}-${title}.png`, describe);
    }

    yield nightmare.end();
  })(function(err, result) {
    if (err) throw err;
  });
};
