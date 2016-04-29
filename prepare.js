const _ = require('lodash');
const async = require('async');
const copy = require('cp-file');
const join = require('path').join;

const createTmpDir = require('./lib/createTmpDir');


const cp = _.curry((
  from
, to
, cb
) => (
  copy(from, to)
  .then(() => cb(null))
  .catch(cb)
), 3);


const TMP_DIR = '__manifests';
const DEPLOYMENT_MANIFEST = 'deploymentManifest.json';

const prepare = (
  plugins
, deploymentManifestPath
, tmpDir
, done
) => {
  const getFile = _.find(plugins, (p) => p.getFile).getFile;
  const getFileAs = _.find(plugins, (p) => p.getFileAs).getFileAs;

  const getReleaseManifest = require('./lib/getReleaseManifest')(getFileAs);
  const getAppManifests = require('./lib/getAppManifests')(getFile);


  tmpDir = tmpDir || join(process.cwd(), TMP_DIR);
  const tmpDeploymentManifest = join(tmpDir, DEPLOYMENT_MANIFEST);

  const afterPlugins = _.map(_.filter(plugins, (p) => p.afterPrepare),
    (p) => p.afterPrepare.bind(p, tmpDir));
  const afterReleasePlugins = _.map(_.filter(plugins, (p) => p.afterGetReleaseManifest),
    (p) => p.afterGetReleaseManifest.bind(p, tmpDir));
  const afterDeploymentPlugins = _.map(_.filter(plugins, (p) => p.afterGetDeploymentManifest),
    (p) => p.afterGetDeploymentManifest.bind(p, tmpDir));

  const afterRelease = afterReleasePlugins
    .concat([getAppManifests(tmpDir)])
    .concat(afterPlugins);

  async.waterfall([
    createTmpDir(tmpDir)
    , (next) => {
      cp(deploymentManifestPath, tmpDeploymentManifest)((err) => {
        if (err) return next(err);
        next(null, require(tmpDeploymentManifest));
      });
    }
  ].concat(afterDeploymentPlugins)
  .concat([
    getReleaseManifest(tmpDir)
  ])
  .concat(afterRelease)
  , done);
};

module.exports = prepare;
