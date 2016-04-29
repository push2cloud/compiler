const debugCb = require('./debugCb');
const exec = require('shelljs').exec;
const debug = require('debug')('push2cloud-compiler:compiler:symLink');

const cmd = (
  source
, target
) => (
  `[[ ! -d ${source} ]] && ln -s ${target} ${source} || true`
);


const symLink = (
  source
, target
, cb
) => {
  const command = cmd(source, target);
  debug('sym linking', command);
  exec(command, {silent: false, async:true}, debugCb(debug, cb));
};

module.exports = symLink;
