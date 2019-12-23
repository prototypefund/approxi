import Model from '../../database/model';
import schema from '../../../schemas/surveys';

export default () => ({
  async start({ database }) {
    return new Model(database, 'surveys', schema);
  }
});
