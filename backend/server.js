const express = require("express");
const chats = require("./data/data"); // Importing the chats array correctly
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes")
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
dotenv.config();
connectDB();
const app = express();

app.use(express.json()); // to acceptjson file

app.get("/", (req, res) => {
  res.send("API is working");
});

app.use("/api/user", userRoutes);
app.use('/api/chat', chatRoutes);
app.use(notFound);
app.use(errorHandler);
// app.use("/api/login", userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running at ${PORT}`);
});
