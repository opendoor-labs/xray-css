"use strict";

const fs = require('fs'),
      path = require('path'),
      vo = require('vo'),
      mkdirp = vo(require('mkdirp')),
      Mocha = require('mocha'),
      assert = require('assert'),
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
        dirname = path.dirname(filepath);

  const suite = Mocha.Suite.create(parent, basename);
  const nightmare = Nightmare();

  // load the file
  yield nightmare
    .goto(`file://${filepath}`)
    .inject('css', css)
    .exists('body');

  // pull out describe blocks
  var describes = yield nightmare.evaluate(getDescribes);

  if (describes.length)
    suite.afterAll(nightmare.end.bind(nightmare));
  else
    yield nightmare.end();

  const latestPath = path.join(dirname, 'latest', basename),
        passingPath = path.join(dirname, 'passing', basename),
        diffPath = path.join(dirname, 'diff', basename);
  // add a test for each describe
  describes.forEach(function(describe, i) {
    suite.addTest(new Mocha.Test(describe.title, function(done) {
      const title = describe.title || i,
            latest = path.join(latestPath, title) + '.png',
            passing = path.join(passingPath, title) + '.png',
            diff = path.join(diffPath, title) + '.png';

      vo([
        mkdirp(latestPath),
        mkdirp(passingPath),
        mkdirp(diffPath)
      ],
      function *() { yield nightmare.screenshot(latest, describe.clip) },
      function(err, next) {
        if (err) return next(err);
        if (fs.existsSync(passing)) {
          const blink = new BlinkDiff({
            imageAPath: latest,
            imageBPath: passing,
            imageOutputPath: diff,
            threshold: 20,
          });
          blink.run(function(err, result) {
            if (err) return next(err);
            next(blink.hasPassed(result.code) ? null : Error('Output does not match'));
          });
        } else {
          fs.createReadStream(from).pipe(fs.createWriteStream(to))
            .on('finish', next);
        }
      })(done);
    }));
  });
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
