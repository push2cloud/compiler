const _ = require('lodash');

const mapAppSource = (
  releaseManifest
, appName
) => {
  const app = releaseManifest.apps[appName] || releaseManifest.utilityApps[appName];
  return _.assign(
    {}
  , app.source
  , { path: app.path }
  , releaseManifest.source
  );
};

module.exports = mapAppSource;
