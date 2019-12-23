import systemic from 'systemic';
import config from './config';
import nuxt from './nuxt';

export default () => systemic({ name: 'nuxt' })
  .add('nuxt.config', config())
  .add('nuxt.middleware', nuxt()).dependsOn('nuxt.config', 'app');
