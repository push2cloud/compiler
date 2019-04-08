const _ = require('lodash');

const mapAppSource = (
  releaseManifest,
  appName
) => {
  const app = releaseManifest.apps[appName] || releaseManifest.utilityApps[appName];
  return _.assign(
    {},
    releaseManifest.source,
    { path: app.path },
    app.source
  );
};

module.exports = mapAppSource;
