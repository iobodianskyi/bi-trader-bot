(() => {
  const io = require('socket.io-client');
  const resources = require('../resources');

  const init = () => {
    const socket = io.connect(
      resources.app.urls.bStreams.publicUrl,
      {
        path: resources.app.urls.bStreams.sockets.path,
        reconnect: true
      });

    socket.on('connect', () => {
      console.log('socket connected to b-streams');
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected to b-streams');
    });

    return socket;
  }

  module.exports = { init };
})();
