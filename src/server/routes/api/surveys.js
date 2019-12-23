import { Router, json } from 'express';
import { Validator, ValidationError } from 'express-json-validator-middleware';
import ajvTransform from 'ajv-keywords/keywords/transform';
import debug from 'debug';
import asyncMiddleware from '../../middlewares/async';
import stepRangeValidator from '../../../schemas/validators/step-range';
import surveysSchema from '../../../schemas/surveys';
import feedSchema from '../../../schemas/surveys/feed';

const log = debug('server:routes:api:surveys');

const validator = new Validator({
  allErrors: true,
  format: false,
  removeAdditional: 'all',
  useDefaults: 'empty',
  coerceTypes: 'array',
  ownProperties: true,
  $data: true
});

stepRangeValidator(validator.ajv);
ajvTransform(validator.ajv);

// TODO: Implement better version of the multipleOf keyword which handles floating point via mathjs.nearlyEqual (e. g. 0.3 / 0.1).

export default (parent, surveysService) => {
  const router = Router();
  router.use(json());

  router.post('/',
    validator.validate({
      body: surveysSchema
    }),
    asyncMiddleware(async (req, res, next) => {
      log('post /');
      const survey = req.body;
      const id = await surveysService.insertSurvey(survey);
      res.send({ id });
    })
  );

  router.param('id', asyncMiddleware(async (req, res, next, id) => {
    log(`param id '${id}'`);
    if (req.path === '/') {
      next();
    }
    const survey = await surveysService.getSurvey(id);
    if (survey) {
      req.survey = survey;
      next();
    } else {
      res.sendStatus(404);
    }
  }));

  router.get('/:id', asyncMiddleware(async (req, res) => {
    log(`get /${req.params.id}`);
    res.send(req.survey);
  }));

  router.get('/:id/stats', asyncMiddleware(async (req, res, next) => {
    log(`get /${req.params.id}/stats`);
    const result = await surveysService.getStatsForSurvey(req.param.id);
    res.send(result);
  }));

  router.post('/:id/feed',
    validator.validate({
      body: feedSchema
    }),
    asyncMiddleware(async (req, res, next) => {
      log(`post /${req.params.id}/feed`);
      const input = req.body;
      const survey = req.survey;
      try {
        const result = await surveysService.feedStatsForSurvey(input, survey);
        res.send(result); // TODO: send "204 No Content instead" here
      } catch (err) {
        if (err instanceof RangeError) {
          res.status(422).json({ errors: [err.message] });
        } else {
          throw err;
        }
      }
    })
  );

  router.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
      log(err);
      log(err.validationErrors);
      log(req.body);
      res.status(400).json({ errors: err.validationErrors });
    } else {
      next(err);
    }
  });

  parent.use('/surveys', router);

  return router;
};
