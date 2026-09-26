const { withProjectBuildGradle } = require("expo/config-plugins");
const path = require("path");

module.exports = function withNotifee(config) {
  return withProjectBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    if (!buildGradle.includes("notifee")) {
      const notifeeLibsPath = path.resolve(
        config.modRequest.projectRoot,
        "node_modules/@notifee/react-native/android/libs"
      );

      config.modResults.contents = buildGradle.replace(
        "maven { url 'https://www.jitpack.io' }",
        `maven { url 'https://www.jitpack.io' }\n        maven { url("${notifeeLibsPath}") }`
      );
    }

    return config;
  });
};
