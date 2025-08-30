module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      // Remove the CommonJS transform plugin as it conflicts with ES module exports
      // '@babel/plugin-transform-modules-commonjs',
    ],
  };
};
