import cloneDeep from 'lodash/cloneDeep';
import config from '../../../config';

export default () => ({
  async start() {
    return cloneDeep(config);
  }
});
