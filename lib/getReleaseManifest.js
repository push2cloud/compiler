const _ = require('lodash');
const debug = require('debug')('push2cloud-compiler:prepare:getReleaseManifest');
const debugCb = require('./debugCb');
const join = require('path').join;


module.exports = _.curry((
  getFile
, tmpDir
, deploymentManifest
, cb
) => {
  debug('starting...');
  const manifest = deploymentManifest;
  const release = manifest.release;
  const source = release.source;
  const releaseManifestPath = join(tmpDir, 'releaseManifest.json');

  if (release.version) {
    try {
      if (require(releaseManifestPath).version === release.version) return cb(null, releaseManifestPath);
    } catch (e) {}
  }

  const ctx = {
    repo: source.url
  , reference: source.referenceValue
  , targetDir: tmpDir
  , targetFile: releaseManifestPath
  , file: release.manifest
  };

  getFile(ctx)(debugCb(debug, (err, data) => {
    if (err) return cb(err);
    cb(null, require(releaseManifestPath));
  }));
}, 4);
