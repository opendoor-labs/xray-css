var vo = require('vo');
var Nightmare = require('nightmare');
var path = require('path');

var css = path.join(__dirname, 'index.css');
 
module.exports = function(argv) {
  const file = path.join(process.cwd(), argv._[0]),
        extension = path.extname(file)
        base = file.replace(extension, '');

  vo(function *() {
    const nightmare = Nightmare();

    yield nightmare
      .goto(`file://${file}`)
      .inject('css', css)
      .exists('body');

    var describes = yield nightmare.evaluate(function() {
        return Array.prototype.map.call(document.querySelectorAll('describe'), function(element) {
          return {
            x: element.offsetLeft,
            y: element.offsetTop,
            width: element.offsetWidth,
            height: element.offsetHeight
          };
        });
      });
    for (var i = 0; i < describes.length; i++)
      yield nightmare.screenshot(`${base}-${i}.png`, describes[i]);

    yield nightmare.end();
  })(function(err, result) {
    if (err) throw err;
  });
};
