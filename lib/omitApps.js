const _ = require('lodash');
const debug = require('debug')('push2cloud-compiler:compiler:omit-apps');

const omitApps = (
  excludeApps
, apps
) => {
  const omited = _.omit(apps, (app, appName) =>
    _.includes(excludeApps, appName));

  debug(excludeApps);
  return omited;
};

module.exports = omitApps;
