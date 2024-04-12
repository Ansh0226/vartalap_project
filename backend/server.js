const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();
connectDB();
const app = express();

app.use(express.json()); // to accept json file

app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  socket.on("setup", (userData) => {
    // socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);

    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => {
    socket.to(room).emit("typing");
  });

  socket.on("stop typing", (room) => {
    socket.to(room).emit("stop typing");
  });

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.to(user._id).emit("message received", newMessageRecieved);
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from socket.io");
  });
});

server.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`.yellow.bold)
);
