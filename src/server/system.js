import path from 'path';
import systemic from 'systemic';

const components = path.join(__dirname, 'components');

export default () => systemic({ name: 'main' }).bootstrap(components);
