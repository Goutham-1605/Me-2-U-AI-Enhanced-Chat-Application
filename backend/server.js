const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

dotenv.config({ path: path.join(__dirname, '../.env') });
const connectDB = require('./config/db');
connectDB();
const { getAIResponse } = require('./utils/aiBot');

const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { notFound, errorHandler } = require('./Middlewares/errorMiddlerware');

const app = express();
app.use(express.json());


app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
});


app.get("/", (req, res) => { res.send("Backend is running"); });
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);
app.use(notFound);
app.use(errorHandler);


io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
    console.log("User room created:", userData._id);
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined chat room:", room);
  });

  socket.on("new message", async (newMessageReceived) => {
  const chat = newMessageReceived.Chat;
  if (!chat.users) return;


  chat.users.forEach((user) => {
    if (user._id === newMessageReceived.sender._id) return;
    socket.in(user._id).emit("message received", newMessageReceived);
  });

  
  const messageContent = newMessageReceived.content;
  if (messageContent && messageContent.toLowerCase().includes("@ai")) {
    try {
      const query = messageContent.replace(/@ai/gi, "").trim();

      
      chat.users.forEach((user) => {
        socket.in(user._id).emit("botTyping", { isTyping: true });
      });

      
      socket.emit("botTyping", { isTyping: true });

      
      const aiReply = await getAIResponse(
        chat._id,         
        query,             
        newMessageReceived.sender.name  
      );

    
      chat.users.forEach((user) => {
        socket.in(user._id).emit("botTyping", { isTyping: false });
      });
      socket.emit("botTyping", { isTyping: false });

      
      const botMessage = {
        _id: `bot-${Date.now()}`,
        sender: {
          _id: "ai-bot",
          name: "🤖 AI Assistant",
          pic: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
        },
        content: aiReply,
        Chat: chat,
        createdAt: new Date().toISOString(),
        isBot: true,
      };

      
      chat.users.forEach((user) => {
        socket.in(user._id).emit("message received", botMessage);
      });
      socket.emit("message received", botMessage);

    } catch (error) {
      console.error("Gemini error:", error.message);

      
      chat.users.forEach((user) => {
        socket.in(user._id).emit("botTyping", { isTyping: false });
      });
      socket.emit("botTyping", { isTyping: false });

      
      const errorMessage = {
        _id: `bot-err-${Date.now()}`,
        sender: {
          _id: "ai-bot",
          name: "🤖 AI Assistant",
          pic: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
        },
        content: "Sorry, I couldn't process that. Try again!",
        Chat: chat,
        createdAt: new Date().toISOString(),
        isBot: true,
      };

      chat.users.forEach((user) => {
        socket.in(user._id).emit("message received", errorMessage);
      });
      socket.emit("message received", errorMessage);
    }
  }
});


  socket.on("group updated", (updatedChat) => {
    updatedChat.users.forEach((user) => {
      socket.in(user._id).emit("group updated", updatedChat);
    });
  });

  socket.on("user added to group", ({ updatedChat, addedUserId }) => {
    
    socket.in(addedUserId).emit("group updated", updatedChat);
    
    updatedChat.users.forEach((user) => {
      socket.in(user._id).emit("group updated", updatedChat);
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const Port = process.env.Port || 5000;
server.listen(Port, () => { console.log(`Server started at port ${Port}`); });