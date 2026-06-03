/**
 * React Native CLI config. backend-agent/ is not a native module;
 * it is excluded from Metro bundles via metro.config.js for release builds.
 */
module.exports = {
  project: {
    ios: {},
    android: {},
  },
};
