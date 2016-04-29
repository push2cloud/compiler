const loadJsonFile = require('load-json-file');
const join = require('path').join;
const debug = require('debug')('push2cloud-compiler:compiler:requireJSON');


const requireManifest = (dir) => (json) => {
  debug(dir, json);
  return loadJsonFile.sync(dir ? join(dir, json) : json);
};

module.exports = requireManifest;
