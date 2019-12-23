import Model from '../../database/model';
import schema from '../../../schemas/surveys/stats';

export default () => ({
  async start({ database }) {
    const stats = new Model(database, 'stats', schema);
    stats.hiddenProperties.push('_rssData');
    return stats;
  }
});
