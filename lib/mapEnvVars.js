const underscored = require('underscore.string/underscored');
const _ = require('lodash');
const replaceEnvVar = require('./replaceEnvVar');
const debug = require('debug')('push2cloud-compiler:compiler:envVars');

const mapEnvVars = (
  deploymentManifest
, releaseManifest
, appManifests
) => (
  _.flattenDeep(_.map(appManifests, (app) => {
    const appNameCapitalized = underscored(app.name).toUpperCase();
    const autoEnv = _.mapKeys(deploymentManifest.autoEnvReplacement, (v, key) => key.replace('${APPNAME}', appNameCapitalized));

    var merged = _.merge(autoEnv, _.get(deploymentManifest, 'applicationDefaults.env'), _.get(releaseManifest, 'applicationDefaults.env'), app.deployment.env, _.get(deploymentManifest, 'apps.' + app.name + '.env'));

    var envs = _.reduce(merged, (res, value, key) => {
      const envReplacement = deploymentManifest.envReplacement || {};
      const autoEnvReplacement = deploymentManifest.autoEnvReplacement || {};

      const replacedValue = replaceEnvVar(envReplacement, autoEnvReplacement, app.name, key, value);

      if (replacedValue && !replacedValue.replace) {
        res[key] = JSON.stringify(replacedValue);
      } else {
        res[key] = replacedValue
                    .replace('${APP_VERSION}', app.version)
                    .replace('${SYSTEM_VERSION}', releaseManifest.version)
                    .replace('${org}', deploymentManifest.target.org)
                    .replace('${space}', deploymentManifest.target.space);
      }
      debug(app.name, key + ' -> ' + replacedValue);
      return res;
    }, {});

    return { name: app.name
           , env: envs
           };
  }))
);

module.exports = mapEnvVars;
