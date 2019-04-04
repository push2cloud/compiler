const _ = require('lodash');

const mapServices = (
  deploymentManifest
, releaseManifest
, appManifests
) => {

  const mapService = (app) => (serviceToMap) => {
    let serviceName;
    const serviceMapping = _.find(deploymentManifest.serviceMapping, (mapping, key) => {
      const rawServiceName = key.replace('*', '');

      if (key[0] === '*' || key[key.length - 1] === '*') {
        const isPrefix = _.endsWith(serviceToMap, rawServiceName);
        const isSuffix = _.startsWith(serviceToMap, rawServiceName);
        if (isPrefix || isSuffix) {
          serviceName = serviceToMap;
        }
        return isPrefix || isSuffix;
      }

      const isMatch = serviceToMap === key;
      if (isMatch) {
        serviceName = serviceToMap;
      }
      return found;
    });

    if (!serviceName) {
      return {};
    }

    return Object.assign({}, serviceMapping, {
      name: serviceName
    });
  };

  return _.uniqBy(_.flattenDeep(appManifests.map(app => {
    const appBindings = app.deployment.serviceBinding || [];
    const services = appBindings.concat(releaseManifest.globalServices);

    return services.map(mapService(app)).filter(!_.isEmpty);
  })), 'name');
};

module.exports = mapServices;
