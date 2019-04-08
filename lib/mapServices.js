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

      if (key[0] === '*' || key[key.length - 1] === '*') {
        const isPrefix = _.endsWith(serviceToMap, rawServiceName);
        const isSuffix = _.startsWith(serviceToMap, rawServiceName);
        const isMatch = isPrefix || isSuffix;
        if (isMatch) {
          serviceName = serviceToMap;
        }
        return isMatch;
      }

      const isMatch = serviceToMap === key;
      if (isMatch) {
        serviceName = serviceToMap;
      }
      return isMatch;
    });

    if (!serviceName) {
      return {};
    }

    return Object.assign({}, serviceMapping, {
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
