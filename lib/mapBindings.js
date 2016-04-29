const _ = require('lodash');
const debug = require('debug')('push2cloud-compiler:compiler:bindings');

const mapBindings = (
  deploymentManifest
, releaseManifest
, appManifests
) => {
  return _.flattenDeep(_.map(appManifests, (app) => {
    const appBindings = app.deployment.serviceBinding || [];
    const services = _.compact(appBindings.concat(releaseManifest.globalServices));
    const bindings = _.map(services, (binding) => ({
      app: app.name
    , service : binding
    }));
    debug(app.name, bindings);
    return bindings;
  }));
};

module.exports = mapBindings;
