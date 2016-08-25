const _ = require('lodash');
const debug = require('debug')('push2cloud-compiler:prepare:getReleaseManifest');
const debugCb = require('./debugCb');
const join = require('path').join;


module.exports = _.curry((
  plugins
, tmpDir
, deploymentManifestPath
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

  var ctx = _.cloneDeep(source);
  ctx.targetDir = tmpDir;
  ctx.targetFile = releaseManifestPath;
  ctx.file = release.manifest;
  ctx.rootDir = deploymentManifestPath;

  const releaseSourceType = deploymentManifest.release.source.type;
  const p = _.find(plugins, (p) => p.getFileAs && p.type === releaseSourceType);
  if (!p) {
    var err = new Error(`No plugin found that exposes getFileAs function for type: ${releaseSourceType}`);
    debug(err);
    return cb(err);
  }

  p.getFileAs(ctx)(debugCb(debug, (err) => {
    if (err) return cb(err);
    cb(null, require(releaseManifestPath));
  }));
}, 4);
