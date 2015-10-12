"use strict";

const fs = require('fs'),
      path = require('path'),
      vo = require('vo'),
      mkdirp = vo(require('mkdirp')),
      cp = vo(require('cp')),
      Mocha = require('mocha'),
      Nightmare = require('nightmare'),
      BlinkDiff = require('blink-diff');

const debug = require('debug')('xray'),
      css = path.join(__dirname, 'index.css');
 
module.exports = function(argv) {
  const mocha = new Mocha();

  vo(function *() {
    for (let i = 0; i < argv._.length; i++)
      yield addSuite(mocha.suite, argv._[i]);
  })(function(err, result) {
    if (err) throw err;

    mocha.run(function(failures) {
      process.on('exit', function() {
        process.exit(failures);
      });
    });
  });
};

function *addSuite(parent, file) {
  const filepath = path.join(process.cwd(), file),
        basename = path.basename(file),
        dirname = path.dirname(filepath),
        currentPath = path.join(dirname, 'current', basename),
        passingPath = path.join(dirname, 'passing', basename),
        diffPath = path.join(dirname, 'diff', basename);

  const suite = Mocha.Suite.create(parent, basename);
  const nightmare = Nightmare();

  // load the file
  yield nightmare
    .goto(`file://${filepath}`)
    .inject('css', css)
    .exists('body');

  // pull out describe blocks
  var describes = yield nightmare.evaluate(getDescribes);

  // add a test for each describe
  describes.forEach(function(describe, i) {
    suite.addTest(new Mocha.Test(describe.title, function(done) {
      const title = describe.title || i,
            diff = {
              imageAPath: path.join(currentPath, title) + '.png',
              imageBPath: path.join(passingPath, title) + '.png',
              imageOutputPath: path.join(diffPath, title) + '.png',
              threshold: 20
            };

      vo(

        // create directories
        [ mkdirp(currentPath), mkdirp(passingPath), mkdirp(diffPath) ],

        // take screenshot
        function *() {
          yield nightmare.screenshot(diff.imageAPath, describe.clip)
        },

        // compare to last screenshot
        function(_, next) {
          if (!fs.existsSync(diff.imageBPath))
            return next();

          new BlinkDiff(diff).run(function(err, result) {
            if (err)
              return next(err);

            if (!BlinkDiff.prototype.hasPassed(result.code))
              return next(Error(`(${result.differences}px): ${diff.imageOutputPath}`));

            next();
          });
        },

        // copy A to B
        cp(diff.imageAPath, diff.imageBPath)

      )(done);
    }));
  });

  // clean up nightmare
  if (describes.length)
    suite.afterAll(nightmare.end.bind(nightmare));
  else
    yield nightmare.end();
}

function getDescribes() {
  var map = Array.prototype.map;
  return map.call(document.querySelectorAll('describe'), function(node) {
    return {
      title: node.title,
      clip: {
        x: node.offsetLeft,
        y: node.offsetTop,
        width: node.offsetWidth,
        height: node.offsetHeight,
      }
    };
  });
}
