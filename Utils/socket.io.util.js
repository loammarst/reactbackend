let io;
exports.socketConnection = (server) => {
  io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
  io.on("connection", (socket) => {
    console.info(`Client connected [id=${socket.id}]`);
    socket.join(socket.request._query.id);
    socket.on("disconnect", () => {
      console.info(`Client disconnected [id=${socket.id}]`);
    });
    socket.on("send_signal_update_echutter", (data) => {
      console.log(data);
      io.emit(
        "receive_signal_update_echutter",
        "server_force_to_load_echutter"
      );
    });
  });
};
exports.sendMessage = (roomId, key, message) =>
  io.to(roomId).emit(key, message);
exports.sendMessageWithKey = (key, message) => {
  io.emit(key, message);
};
exports.getRooms = () => io.sockets.adapter.rooms;
