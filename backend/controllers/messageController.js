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

const editMessage = expressAsyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) {
    res.status(400);
    throw new Error("Content cannot be empty");
  }

  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  
  if (message.sender.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only edit your own messages");
  }

  if (message.isDeleted) {
    res.status(400);
    throw new Error("Cannot edit a deleted message");
  }

  message.content = content.trim();
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();

  
  const updated = await Message.findById(message._id)
    .populate("sender", "Name Pic Email")
    .populate({
      path: "Chat",
      populate: {
        path: "users",
        select: "Name Pic Email",
      },
    });

  res.status(200).json(updated);
});

const deleteMessage = expressAsyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  
  if (message.sender.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only delete your own messages");
  }

  if (message.isDeleted) {
    res.status(400);
    throw new Error("Message already deleted");
  }

  message.isDeleted = true;
  message.content = "This message was deleted";
  await message.save();


  const updated = await Message.findById(message._id)
    .populate("sender", "Name Pic Email")
    .populate({
      path: "Chat",
      populate: {
        path: "users",
        select: "Name Pic Email",
      },
    });

  res.status(200).json(updated);
});


const pinMessage = expressAsyncHandler(async (req, res) => {
  const { messageId, chatId } = req.body;

  if (!messageId || !chatId) {
    res.status(400);
    throw new Error("messageId and chatId are required");
  }

  const message = await Message.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }

  if (message.isDeleted) {
    res.status(400);
    throw new Error("Cannot pin a deleted message");
  }

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    { pinnedMessage: messageId },
    { new: true }
  ).populate({
    path: "pinnedMessage",
    populate: { path: "sender", select: "Name Pic" },
  });

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  res.status(200).json(chat.pinnedMessage);
});


const getPinnedMessage = expressAsyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId).populate({
    path: "pinnedMessage",
    populate: { path: "sender", select: "Name Pic" },
  });

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  
  res.status(200).json(chat.pinnedMessage || null);
});

module.exports = {
  sendMessage,
  allMessages,
  editMessage,
  deleteMessage,
  pinMessage,
  getPinnedMessage,
};