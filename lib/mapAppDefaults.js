const _ = require('lodash');

const mapAppDefaults = (
  apps
, deploymentManifest
, releaseManifest
) => (
  _.map(apps, (app) =>
    _.assign({
      name: app.name || app.deployment.name,
      version: app.version || app.deployment.version
    }
    , _.omit(deploymentManifest.applicationDefaults, 'env')
    , _.omit(app.deployment, 'env')
    , releaseManifest.apps ? _.omit(releaseManifest.apps[app.name], 'env') : {}
    , deploymentManifest.apps ? _.omit(deploymentManifest.apps[app.name], 'env') : {}
    )
  )
);

module.exports = mapAppDefaults;
