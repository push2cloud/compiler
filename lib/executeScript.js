const debug = require('debug')('push2cloud-compiler:build-workspace:executeScripts');
const _ = require('lodash');
const exec = require('shelljs').exec;
const debugCb = require('./debugCb');

const executeScript = _.curry((
  command
, cb
) => {
  if (!command) {
    debug('no command to execute');
    return debugCb(debug, cb)();
  }
  debug('Executing command', command);
  exec(command, {silent: true, async: true}, debugCb(debug, cb));
});

module.exports = executeScript;
