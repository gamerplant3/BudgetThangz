const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * backend-agent/ is Python dev-only and must not be bundled into release APKs.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    blockList: [/[/\\]backend-agent[/\\].*/],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
