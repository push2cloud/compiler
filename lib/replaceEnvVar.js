const underscored = require('underscore.string/underscored');

const replaceEnvVar = (
  envReplacement
, autoEnvReplacement
, appName
, key
, value
) => {
  const appNameCapitalized = underscored(appName).toUpperCase();
  const TEMPLATE_REGEXP = /\$\{(\w*)\}/g;

  if (value && !value.replace) return JSON.stringify(value);

  return value.replace(TEMPLATE_REGEXP, (str, match) => {
    const autoKey = match.replace(appNameCapitalized, '${APPNAME}');
    const guessedAutoKey = match.replace(/(.*)_/, '${APPNAME}_');

    const replacement =
      envReplacement[`${appName}.${match}`]
      || envReplacement[match]
      || autoEnvReplacement[`${autoKey}`]
      || autoEnvReplacement[`${guessedAutoKey}`];


    if (!replacement) return str;

    if (replacement.match(TEMPLATE_REGEXP)) {
      return replaceEnvVar(envReplacement, autoEnvReplacement, appName, key, replacement);
    }
    return replacement;
  });
};

module.exports = replaceEnvVar;
