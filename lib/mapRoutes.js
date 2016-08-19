const _ = require('lodash');

const mapRoutes = (
  deploymentManifest
, appManifests
) => {
  const target = deploymentManifest.target;

  return _.flattenDeep(_.map(appManifests, (app) => {
    const appRoutes = app.deployment.routes || (deploymentManifest.apps[app.name]
                                              ? deploymentManifest.apps[app.name].routes
                                              : []);
    return _.map(appRoutes, (routes, type) => (
      _.map(routes, (route) => {
        var r = route;
        if (_.isString(route)) {
          r = {
            hostname: route
          };
        }
        return {
          app: app.name
        , domain: deploymentManifest.domains[type]
        , hostname: _.template(r.hostname)(_.assign({}, app, target, { appname: app.name }))
        , path: r.path
        , port: r.port
        , generatePort: r.generatePort || false
        };
      }))
    );
  }
  ));
};

module.exports = mapRoutes;
