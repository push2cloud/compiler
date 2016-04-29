const _ = require('lodash');
const async = require('async');
const join = require('path').join;

const mapAppDefaults = require('./lib/mapAppDefaults');
const mapEnvVars = require('./lib/mapEnvVars');
const mapRoutes = require('./lib/mapRoutes');
const mapBindings = require('./lib/mapBindings');
const mapScripts = require('./lib/mapScripts');
const mapAppScripts = require('./lib/mapAppScripts');
const mapAppSource = require('./lib/mapAppSource');
const mapServices = require('./lib/mapServices');
const omitApps = require('./lib/omitApps');
const requireJSONIn = require('./lib/requireJSON');
const convertSize = require('./lib/convertSize');


const initialState =
  { version: null
  , target: null
  , services: []
  , apps: []
  , utilityApps: []
  , envVars: []
  , serviceBindings: []
  , routes: []
  , scripts: {}
  };


const compile = (
  plugins
, manifestDir
, deploymentManifestPath
, done
) => {
  manifestDir = manifestDir || join(process.cwd(), '__manifests');
  deploymentManifestPath = deploymentManifestPath || 'deploymentManifest.json';

  const requireJSON = requireJSONIn(manifestDir);
  const requireAppManifests = (apps) => _.map(apps, (app, appName) =>
    requireJSON(join(app.path, app.manifest || 'package.json')));

  // require all the manifests
  const deploymentManifest = requireJSON(deploymentManifestPath);
  const releaseManifest = requireJSON('releaseManifest.json');

  const config = _.assign({}, initialState,
    { version: releaseManifest.version
    , target: deploymentManifest.target
    });


  // APPS
  const apps = omitApps(deploymentManifest.excludeApps, releaseManifest.apps);
  const utilityApps = omitApps(deploymentManifest.excludeApps, releaseManifest.utilityApps);
  const appManifests = requireAppManifests(apps);
  const utilityAppManifests = requireAppManifests(utilityApps);


  config.apps = mapAppDefaults(appManifests, deploymentManifest, releaseManifest);
  config.utilityApps = mapAppDefaults(utilityApps, deploymentManifest, releaseManifest);

  config.apps = _.map(config.apps, (app) => {
    const appManifest = _.find(appManifests, (tf) => tf.name === app.name);
    if (!appManifest.deployment) throw new Error(`App ${appManifest.name} has no deployment settings`);

    var a = _.assign({},
      app,
      { scripts: mapAppScripts(deploymentManifest, appManifest)
      , source: mapAppSource(releaseManifest, app.name)
      }
    );

    a.memory = convertSize(a.memory);
    a.disk = convertSize(a.disk);
    a.instances = convertSize(a.instances);

    return a;
  });

  config.utilityApps = _.map(config.utilityApps, (utilityApp) => {
    const utilityAppManifest = _.find(utilityAppManifests, (tf) => tf.name === utilityApp.name);

    return _.assign({},
      utilityApp,
      { scripts: mapAppScripts(deploymentManifest, utilityAppManifest)
      , source: mapAppSource(releaseManifest, utilityApp.name)
      }
    );
  });


  // ROUTES
  config.routes = mapRoutes(deploymentManifest, appManifests);

  // SERVICE BINDINGS
  config.serviceBindings = mapBindings(deploymentManifest, releaseManifest, appManifests);

  // ENVIRONEMT VARIABLES
  config.envVars = mapEnvVars(deploymentManifest, releaseManifest, appManifests);

  // SCRIPTS
  config.scripts = mapScripts(releaseManifest);

  // SERVICES
  config.services = mapServices(deploymentManifest, releaseManifest, appManifests);


  // PLUGIN TOOLS
  const tools = {};
  tools.findApp = (a) => _.find(appManifests, (tf) => tf.name === a);
  tools.findServiceBinding = (s) => _.find(config.serviceBindings, (tf) => tf.name === s);
  tools.findEnvVars = (a) => _.find(config.envVars, (tf) => tf.name === a);
  tools.isExcluded = (a) => !!_.includes(deploymentManifest.excludeApps, a);

  // PLUGINS
  //return _.reduce(plugins, ( result,  plugin ) => plugin(result, { deployment: deploymentManifest, release: releaseManifest, apps: appManifests } , tools), config);
  const manis = { deployment: deploymentManifest, release: releaseManifest, apps: appManifests };
  const cleanPlugins = _.compact(plugins);
  _.isEmpty(cleanPlugins) ? done(null, config) :
  async.waterfall([(cb) => cb(null, config, manis, tools)].concat(plugins), done);
};

module.exports = compile;
