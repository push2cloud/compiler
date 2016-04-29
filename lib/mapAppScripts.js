const mapAppScripts = (
  deploymentManifest
, appManifest
) => appManifest.deployment.scripts || deploymentManifest.applicationDefaults.scripts;

module.exports = mapAppScripts;
