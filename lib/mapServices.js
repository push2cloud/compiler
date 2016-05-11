const _ = require('lodash');

const mapServices = (
  deploymentManifest
, releaseManifest
, appManifests
) => {

  const mapService = (app) => (binding) => {
    var serviceName;
    const serviceMapping = _.find(deploymentManifest.serviceMapping, (mapping, key) => {
      var found;
      const endsWithKey = key.replace('*', '');

      if (_.startsWith(key, '*')) {
        found = _.endsWith(binding, endsWithKey);
        if (found) {
          serviceName = binding;
        }
        return found;
      }

      found = binding === key;
      if (found) {
        serviceName = binding;
      }
      return found;
    });

    if (!serviceName) {
      return {};
    }

    return _.assign({}, serviceMapping, {
      name: serviceName
    });
  };

  return _.uniqBy(_.flattenDeep(_.map(appManifests, (app) => {
    const appBindings = app.deployment.serviceBinding || [];
    const services = appBindings.concat(releaseManifest.globalServices);
    return _.reject(_.map(services, mapService(app)), _.isEmpty);
  })), 'name');
};

module.exports = mapServices;
