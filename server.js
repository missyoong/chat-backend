const app = require("express")();
const server = require("http").createServer(app);
const PORT = "https://yoonikuu-chat-backend.herokuapp.com";
const { nanoid } = require("nanoid");
const db = require("./database");
const fs = require("fs");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

let users = [];
let rooms = [];

io.use((socket, next) => {
  socket.onAny((event, data) => {
    if (event === "message") {
      const log = JSON.stringify({
        user: socket.id,
        message: data.message ? data.message : null,
        room: data.room,
        timestamp: new Date(),
      });
      fs.writeFile("data_log.txt", log, { flag: "a" }, (error) => {
        if (error) {
          console.log(error);
        } else {
          console.log("data skrevs till data_log.txt");
        }
      });
    }
  });

  next();
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.emit("me", socket.id);
  users.push(socket.id);

  socket.broadcast.emit("updateUsers", users);

  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected.`);
    users = users.filter((user) => user !== socket.id);
    console.log(users);
    socket.broadcast.emit("updateUsers", users);
    socket.disconnect();
  });

  socket.emit("getAllUsers", users);
  console.log(users);

  // Rooms
  socket.on("create_room", async () => {
    const room = {
      id: nanoid(7),
      capacity: 10,
      usersJoined: [socket.id],
      chat: [],
    };
    socket.join(room);
    socket.emit("get_room", room);
    console.log("Room created: " + room.id);
    rooms.push(room);

    await db.insert({ name: room.id }).into("room");

    socket.broadcast.emit("updateRooms", rooms);
  });

  socket.on("join_room", (room) => {
    socket.room = room.id;
    socket.join(room.id);
    console.log(`user ${socket.id} joined room: ${room.id}`);
  });

  socket.on("leave_room", (data) => {
    console.log(`${socket.id} has left room ${data}`);
    socket.leave(data);
    console.log(socket.rooms);
  });

  socket.on("delete_room", async (room) => {
    await db("room").where("name", room).del();
    await db("messages").where("room", room).del();
  });

  socket.emit("getAllRooms", rooms);

  socket.broadcast.emit("updateRooms", rooms);

  socket.on("message", async (payload) => {
    console.log(`Message from ${socket.id} : ${payload.message}`);
    console.log(payload.message.length);

    if (payload.message.length !== 0) {
      await db
        .insert({
          message: payload.message,
          user: socket.id,
          room: socket.room,
          created_at: new Date(),
        })
        .into("messages");

      rooms.map((room) => {
        if (room.id === payload.room) {
          singleChat = { message: payload.message, writer: payload.socketId };
          room.chat.push(singleChat);
          payload.chat = room.chat;
        }
      });

      io.to(payload.room).emit("chat", payload);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
