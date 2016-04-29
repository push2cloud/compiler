const _ = require('lodash');

const mapScripts = (releaseManifest) => {
  const scripts = releaseManifest.source.scripts;

  return _.reduce(releaseManifest.apps, (result, app) => {
    _.map(app.scripts, (section, sectionName) => {
      if (!result[sectionName]) result[sectionName] = [];
      result[sectionName] = result[sectionName].concat(section);
    });
    return result;
  }, scripts);
};

module.exports = mapScripts;
