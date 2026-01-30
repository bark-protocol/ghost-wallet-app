const { getDefaultConfig } = require("expo/metro-config");
const { withMetro } = require("./packages/sdk/toolkit/metro");

const config = getDefaultConfig(__dirname);

module.exports = withMetro(config);
