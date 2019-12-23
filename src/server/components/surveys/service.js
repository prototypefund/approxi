import SurveysService from '../../services/surveys';

export default () => ({
  async start({
    models: {
      surveys,
      stats
    }
  }) {
    return new SurveysService(surveys, stats);
  }
});
