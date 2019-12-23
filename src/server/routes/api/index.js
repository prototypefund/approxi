import Router from 'express';

export default app => {
  const router = Router();
  app.use('/api', router);
  return router;
};
