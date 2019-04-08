const _ = require('lodash');
const async = require('async');
const copy = require('cp-file');
const join = require('path').join;
const dirname = require('path').dirname;
const rimraf = require('rimraf');

const createTmpDir = require('./lib/createTmpDir');
const getReleaseManifest = require('./lib/getReleaseManifest');
const getAppManifests = require('./lib/getAppManifests');

const cp = _.curry((
  from,
  to,
  cb
) => (
  copy(from, to)
    .then(() => cb(null))
    .catch(cb)
), 3);

const TMP_DIR = '__manifests';
const DEPLOYMENT_MANIFEST = 'deploymentManifest.json';

const prepare = (
  options,
  plugins,
  deploymentManifestPath,
  tmpDir,
  done
) => {
  options = options || {};

  tmpDir = tmpDir || join(process.cwd(), TMP_DIR);
  const tmpDeploymentManifest = join(tmpDir, DEPLOYMENT_MANIFEST);

  var clear = (cb) => cb();

  if (options.clearWorkspace) {
    clear = (cb) => rimraf(tmpDir, cb);
  }

  const afterPlugins = _.map(_.filter(plugins, (p) => p.afterPrepare),
    (p) => p.afterPrepare.bind(p, tmpDir));
  const afterReleasePlugins = _.map(_.filter(plugins, (p) => p.afterGetReleaseManifest),
    (p) => p.afterGetReleaseManifest.bind(p, tmpDir));
  const afterDeploymentPlugins = _.map(_.filter(plugins, (p) => p.afterGetDeploymentManifest),
    (p) => p.afterGetDeploymentManifest.bind(p, tmpDir));

  const afterRelease = afterReleasePlugins
    .concat([getAppManifests(plugins, tmpDir)])
    .concat(afterPlugins);

  async.waterfall([
    clear,
    createTmpDir(tmpDir),
    (next) => {
      cp(deploymentManifestPath, tmpDeploymentManifest)((err) => {
        if (err) return next(err);
        next(null, require(tmpDeploymentManifest));
      });
    }].concat(afterDeploymentPlugins)
    .concat([getReleaseManifest(plugins, tmpDir, dirname(deploymentManifestPath))])
    .concat(afterRelease)
  , done);
};

module.exports = prepare;
