import { createServer } from "https";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.PRODUCTION_ORIGIN]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
  },
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on("join", (room, username) => {
    socket.join(room);
    socket.username = username;
    io.to(room).emit("message", `${socket.username} has joined the room.`);
  });

  socket.on("roomMessage", (room, message) => {
    io.to(room).emit("message", `${socket.username}: ${message}`);
  });

  // Listen for typing events
  socket.on("typing", (room, username) => {
    socket.to(room).emit("typing", username);
  });

  // Listen for stop-typing events
  socket.on("stopTyping", (room, username) => {
    socket.to(room).emit("stopTyping", username);
  });

  socket.on("disconnect", () => {
    io.emit("message", `User ${socket.username} has left the chat.`);
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// httpServer.listen(3001, () => console.log("listening on port 3001"));
