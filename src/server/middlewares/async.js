export default fn => function asyncMiddlewareDecorator(...[err, req, res, next, ...params]) { // express router checks for handlerFunction.length <= 3
  // regular middleware: (req, res, next)
  // param middleware: (req, res, next, ...params)
  // error middleware: (err, req, res, next)
  const result = fn(err, req, res, next, ...params);
  const nextCb = typeof next === 'function' ? next : res;
  return Promise.resolve(result).catch(nextCb);
};
