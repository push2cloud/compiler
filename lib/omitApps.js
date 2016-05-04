const _ = require('lodash');
const debug = require('debug')('push2cloud-compiler:compiler:omit-apps');

const omitApps = (
  excludeApps
, apps
) => {
  const omited = _.omit(apps, excludeApps);

  debug('excludeApps', excludeApps);
  debug('before', apps)
  debug('after', omited)
  return omited;
};

module.exports = omitApps;
