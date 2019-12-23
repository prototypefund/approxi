import cloneDeep from 'lodash/cloneDeep';
import nuxtConfig from '../../../../nuxt.config.js';

export default () => ({
  async start() {
    return cloneDeep(nuxtConfig);
  }
});
