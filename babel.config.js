const pkg = require('./package.json');

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: pkg.engines.node
        },
        useBuiltIns: 'entry',
        corejs: 3,
        ignoreBrowserslistConfig: true
      }
    ]
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-proposal-private-methods',
    '@babel/plugin-proposal-class-properties'
  ]
};
