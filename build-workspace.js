const debug = require('debug')('push2cloud-compiler:build-workspace');
const async = require('async');
const _ = require('lodash');
const mkdirp = _.curry(require('mkdirp'), 2);
const join = require('path').join;

const debugCb = require('./lib/debugCb');
const repoHash = require('./lib/repoHash');
const executeScript = require('./lib/executeScript');
const requireJSONIn = require('./lib/requireJSON');

const tools = {
  executeScript: executeScript
, repoHash: repoHash
};

const buildWorkspace = (
  plugins
, deploymentConfigPath
, workspacePath
, done
) => {
  debug('Creating the workspace...');
  deploymentConfigPath = deploymentConfigPath || join(process.cwd(), 'deploymentConfig.json');
  workspacePath = workspacePath || join(process.cwd(), '__workspace');

  const requireJSON = requireJSONIn();
  debug('loading deploymentConfig');
  const config = requireJSON(deploymentConfigPath);
  const hashes = {};
  const getSourcePlugins = _.filter(plugins, (p) => p.getSource);
  const postActionPlugins = _.filter(plugins, (p) => p.postAction);
  debug('building workspace');

  async.series(
    [ mkdirp(workspacePath)
    , (cb) => async.each(
        config.apps
      , (app, next) => {
        const hash = repoHash(app.source);
        debug(app.name + ' ' + hash);
        const target = join(workspacePath, 'by-id', hash);

        if (hashes[hash]) return next();
        hashes[hash] = app.source;
        debug(plugins, getSourcePlugins);

        async.series(
          _.map(getSourcePlugins, (p) => p.getSource(app, target))
          , next);
      }, cb)
    , (cb) => async.eachSeries(
       _.keys(hashes)
      , (hash, next) => {
        debug('starting postActions');
        const source = hashes[hash];
        const rootDir = join(workspacePath, 'by-id', hash);

        async.series(
          _.map(postActionPlugins, (p) =>
            p.postAction(source, rootDir, hash, deploymentConfigPath, tools))
        , next);
      }, cb
    )
    ], debugCb(debug, (err) => done(err, hashes))
  );
};

module.exports = buildWorkspace;
