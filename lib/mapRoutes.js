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
      _.map(routes, (route) => (
        { app: app.name
        , domain: deploymentManifest.domains[type]
        , hostname : _.template(route)(_.assign({}, app, target, { appname: app.name }))
        })
      ))
    );
  }
  ));
};

module.exports = mapRoutes;
