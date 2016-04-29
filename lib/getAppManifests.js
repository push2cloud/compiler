const _ = require('lodash');
const debug = require('debug')('push2cloud-compiler:prepare:getAppManifests');
const debugCb = require('./debugCb');
const async = require('async');
const join = require('path').join;

const MANIFEST_NAME = process.env.MANIFEST_NAME || 'package.json';
const APP_PATH = '.';

module.exports = _.curry((
  getFile
, tmpDir
, releaseManifest
, done
) => {
  debug('starting...');

  const apps = releaseManifest.apps || [];
  const utilityApps = releaseManifest.utilityApps || [];
  const allApps = _.assign({}, apps, utilityApps);

  async.forEachOfSeries(allApps, (
      app
    , appName
    , cb
  ) => {
    const source = app.source || releaseManifest.source;
    const packageJson = join(app.path || APP_PATH, app.manifest || MANIFEST_NAME);
    try {
      const cached = require(join(tmpDir, packageJson));
      if (cached.version === app.version) return cb(null);
    } catch (e) {}

    const ctx = {
      repo: source.url
    , reference: source.referenceValue
    , target: tmpDir
    , file: packageJson
    };

    getFile(ctx)(debugCb(debug, (err, data) => {
      if (err) return cb(err);
      cb(null);
    }));
  }, (err) => {
    if (err) return done(err);
    done(null);
  });
}, 4);
