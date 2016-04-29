const replaceScriptTokens = (
  string
, app
) => (
  string
    .replace('${appDir}', app.path)
    .replace('${rootDir}', app.cloneDir)
);

module.exports = replaceScriptTokens;
