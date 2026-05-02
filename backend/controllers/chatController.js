const express = require('express')
const expressAsyncHandler = require('express-async-handler')
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const accesChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    
    res.sendStatus(400);
    return;  
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  }).populate("users", "-Password").populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "Name Pic Email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };  

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-Password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }  
});
const fetchChats = expressAsyncHandler(async(req,res)=>{
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users","-Password")
        .populate("groupAdmin","-Password")
        .populate("latestMessage")
        .sort({updatedAt:-1})
        .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "Name Pic Email",
        });
        res.status(200).send(results);
      });
    } catch (error) {
        res.send(400)
        throw new Error(error.message);
        
    }
});
const createGroupChat = expressAsyncHandler(async (req,res) => {
     if (!req.body.users || !req.body.Name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }
  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.Name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-Password")
      .populate("groupAdmin", "-Password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});
const renameGroup = expressAsyncHandler(async (req,res) => {
   const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
    .populate("users", "-Password")
    .populate("groupAdmin", "-Password");

  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  } 
});
const addToGroup = expressAsyncHandler(async (req,res) => {
    const { chatId, userId } = req.body;

  

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-Password")
    .populate("groupAdmin", "-Password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
});
const removeFromGroup= expressAsyncHandler(async (req,res) => {
    const { chatId, userId } = req.body;

  

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-Password")
    .populate("groupAdmin", "-Password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
})
const deleteGroupChat = expressAsyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  
  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only admin can delete the group");
  }

  await Chat.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "Group deleted successfully" });
});
const deleteChat = expressAsyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  await Message.deleteMany({ Chat: req.params.chatId });

  
  await Chat.findByIdAndDelete(req.params.chatId);

  res.status(200).json({ message: "Chat deleted successfully" });
});


module.exports = { accesChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup, deleteGroupChat, deleteChat };

