import helmet from 'helmet';
import cors from 'cors';
import errorhandler from 'errorhandler';
import logger from 'morgan';

export default () => ({
  async start({ app, config }) {
    app.use(cors(config.cors));
    app.use(helmet(config.helmet));
    if (app.get('env') !== 'production') {
      app.use(logger('dev'));
      app.use(errorhandler());
    }
  }
});
