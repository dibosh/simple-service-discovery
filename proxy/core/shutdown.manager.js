const logger = require('./logger');

function manage(server) {
  let connections = [];

  let shutDown = () => {
    logger.log('received kill signal, shutting down gracefully');

    server.close(() => {
      logger.log('closed out remaining connections');
      process.exit(0);
    });

    connections.forEach((curr) => {
      curr.end();
    });

    setTimeout(() => {
      connections.forEach((curr) => {
        curr.destroy();
      });
    }, 5000);

    setTimeout(() => {
      logger.log('could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutDown);
  process.on('SIGINT', shutDown);

  server.on('connection', (connection) => {
    connections.push(connection);
    logger.log('%s connections currently open', connections.length);
    connection.on('close', function () {
      connections = connections.filter((curr) => {
        return curr !== connection;
      });
    });
  });
}

module.exports = {
  manage,
};