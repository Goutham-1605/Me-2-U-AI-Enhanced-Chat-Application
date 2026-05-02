const expressAsyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Chat = require('../models/chatModel');

const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    res.status(400);
    throw new Error("Invalid data passed");
  }
  const chat = await Chat.findById(chatId).populate("users");
  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  if (!chat.isGroupChat) {
    const receiver = chat.users.find(
      (u) => u._id.toString() !== req.user._id.toString()
    );
    if (receiver && receiver.blockedUsers?.includes(req.user._id)) {
      res.status(403);
      throw new Error("You are blocked by this user");
    }
    
    const sender = await User.findById(req.user._id);
    if (sender.blockedUsers?.includes(receiver._id)) {
      res.status(403);
      throw new Error("You have blocked this user. Unblock to send messages.");
    }
  }


  
  const newMessage = await Message.create({
    sender: req.user._id,
    content,
    Chat: chatId,
  });

  const message = await Message.findById(newMessage._id)
    .populate("sender", "Name Pic")
    .populate({
      path: "Chat",
      populate: {
        path: "users",
        select: "Name Pic Email",
      },
    });

  await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

  res.status(201).json(message);
});

const allMessages = expressAsyncHandler(async (req, res) => {
  const messages = await Message.find({ Chat: req.params.chatId })
    .populate("sender", "Name Pic Email")
    .populate({
      path: "Chat",
      populate: {
        path: "users",
        select: "Name Pic Email",
      },
    });

  res.status(200).json(messages);
});

module.exports = { sendMessage, allMessages };