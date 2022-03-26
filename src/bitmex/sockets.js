(() => {
  const io = require('socket.io-client');
  const state = require('../state');

  const init = () => {
    const socket = io.connect(state.app.urls.bStreams.publicUrl, {
      path: state.app.urls.bStreams.sockets.path,
      reconnect: true
    });

    socket.on('connect', () => {
      console.log('socket connected to b-streams');
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected to b-streams');
    });

    return socket;
  };

  module.exports = { init };
})();
