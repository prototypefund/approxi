const pkg = require('./package.json');

module.exports = {
  dev: (process.env.NODE_ENV !== 'production'),
  mode: 'universal',
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  loading: {
    color: '#fff'
  },
  css: [
    '~assets/stylesheets/scaffolding/main.less'
  ],
  plugins: [
    '~plugins/linkify.js'
  ],
  buildModules: [
    '@nuxtjs/eslint-module'
  ],
  modules: [
    '@nuxtjs/axios'
    // '@nuxtjs/component-cache'
  ],
  axios: {},
  build: {
    babel: {
      presets({ isServer }, [_, { buildTarget }], options = {}) {
        const envTargets = {
          client: { browsers: pkg.browserslist },
          server: { node: pkg.engines.node }
        };
        return [
          [
            '@nuxt/babel-preset-app',
            {
              ...options,
              targets: envTargets[buildTarget],
              useBuiltIns: 'entry',
              corejs: {
                version: 3
              }
            }
          ]
        ];
      }
    },
    extend(config, ctx) {}
  },
  router: {
    prefetchLinks: false
  },
  // publicPath: 'https://cdn.example.org/.nuxt/dist/client', // Default: '/_nuxt/'
  srcDir: 'src/client'
};
