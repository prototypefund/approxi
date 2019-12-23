import systemic from 'systemic';
import routes from './routes';
import service from './service';
import surveys from './surveys';
import stats from './stats';
import stream from './stream';

export default () => systemic({ name: 'surveys' })
  .add('models.surveys', surveys()).dependsOn('database')
  .add('models.stats', stats()).dependsOn('database')
  .add('services.surveys', service()).dependsOn('models.surveys', 'models.stats')
  .add('routes.api.surveys', routes()).dependsOn('routes.api', 'services.surveys')
  .add('streams.stats', stream()).dependsOn('server.ws', 'services.surveys');
