const { withDangerousMod } = require('@expo/config-plugins');

const withSkipImageProcessing = (config) => {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      // Completely skip image processing to avoid permission issues
      console.log('Skipping image processing to avoid permission errors');
      return config;
    },
  ]);
};

module.exports = withSkipImageProcessing; 