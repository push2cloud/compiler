const _ = require('lodash');

const mapServices = (
  deploymentManifest
  , releaseManifest
  , appManifests
) => {
  console.log('called mapServices()');

  const mapService = (app) => (serviceToMap) => {
    console.log('app', app);
    console.log('Currently mapping service: ', serviceToMap);
    let serviceName;
    const serviceMapping = deploymentManifest.serviceMapping.filter((mapping, key) => {
      const rawServiceName = key.replace('*', '');
      console.log('rawServiceName', rawServiceName);
      console.log('key', key);
      console.log("key[0] === '*' || key[key.length - 1] === '*'", key[0] === '*' || key[key.length - 1] === '*');
      if (key[0] === '*' || key[key.length - 1] === '*') {
        const isPrefix = _.endsWith(serviceToMap, rawServiceName);
        const isSuffix = _.startsWith(serviceToMap, rawServiceName);
        const isMatch = isPrefix || isSuffix;
        if (isMatch) {
          serviceName = serviceToMap;
        }
        console.log('isMatch', isMatch);
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
