var argv = require('optimist')
  .usage('Usage: xray [file]')
  .argv;

require('../')(argv);
