import debug from 'debug';

export default (socketNamespace, service, subject) => {
  const log = debug(`streams${socketNamespace.name.replace('/', ':')}`);

  socketNamespace.on('connect', socket => {
    log(`client ${socket.id} connected`);
    socket.on('disconnect', reason => {
      log(`client ${socket.id} disconnected: ${reason}`);
    });
    socket.on('error', error => {
      log(`client ${socket.id} error`, error);
    });
    socket.on('join', surveyId => {
      if (surveyId) {
        log(`client ${socket.id} joined ${surveyId}`);
        socket.join(surveyId);
      }
    });
  });

  service.on(`change:${subject}`, doc => {
    log(`emit change to ${doc.id}`, doc);
    socketNamespace.to(doc.id).volatile.emit('change', doc);
  });

  return socketNamespace;
};
