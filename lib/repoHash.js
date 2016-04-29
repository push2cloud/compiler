const crypto = require('crypto');
const debug = require('debug')('push2cloud-compiler:compiler:repoHash');

const hash = (string) => crypto.createHash('md5').update(string).digest('hex');

const repoHash = (source) => {
  const val = hash(`${source.type}://${source.referenceType}:${source.referenceValue}@${source.url}`);
  debug(source, val);
  return val;
};

module.exports = repoHash;
