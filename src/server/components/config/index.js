import systemic from 'systemic';
import config from './config';

export default () => systemic({ name: 'config' })
  .add('config', config(), { scoped: true }); // === .configure(config())
