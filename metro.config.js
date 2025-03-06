const { getDefaultConfig } = require('@expo/metro-config');

//Retrieve the default Metro bundler configuration
const defaultConfig = getDefaultConfig(__dirname);

//Adds the .cjs extension to the list of recognized asset extensions
defaultConfig.resolver.assetExts.push('cjs');

//Exports the modified configuration for metro to use
module.exports = defaultConfig;
