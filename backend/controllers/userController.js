/*const expressAsyncHandler = require("express-async-handler");
const User = require('../models/userModel');
const { Error } = require("mongoose");
const generateToken = require('../config/generateToken');

const RegisterUser =expressAsyncHandler (async(req,res)=> {
    const {Name , Email, Password, Pic } = req.body;
    if (!Name || !Email || ! Password) {
        res.status(400);
        throw new Error("Please enter all the fields");
        
    }
    const userExists = await User.findOne({Email})
    if (userExists) {
        res.status(400);
        throw new Error("User already exist");
        
    }
    const user = await User.create ({
        Name,
        Email,
        Password,
        Pic

    });
    if (user){
        res.status(201).json({
            _id:user._id,
            Name: user.Name,
            Email: user.Email,
            Pic: user.Pic,
            token: generateToken(user._id)

        });
    } else {
        res.status(400)
        throw new Error("Failed to create User");
        
    }
    

});
const authUser= expressAsyncHandler(async(req,res)=>{
    const {Email, Password} = req.body;

    const user = await User.findOne({Email});
    if (user && (await user.matchPassword(Password))) {
       res.json({
        _id:user._id,
            Name: user.Name,
            Email: user.Email,
            Pic: user.Pic,
            token: generateToken(user._id)

       });
    }else {
        res.status(400)
        throw new Error("Invalid Email or Password");
    }
});
const allUsers= expressAsyncHandler(async(req,res)=>{
    const keyword = req.query.search ?{
        $or :[{Name:{$regex:req.query.search,$options:"i"}},
            

        ],
    }
    :{};
    const users = await User.find(keyword).find({_id:{$ne:req.user._id}})
    res.send(users)
})
const blockUser = expressAsyncHandler(async (req, res) => {
  const { userToBlockId } = req.body;
  if (!userToBlockId) {
    res.status(400);
    throw new Error("User to block is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { blockedUsers: userToBlockId } }, 
    { new: true }
  );

  res.status(200).json({ message: "User blocked", blockedUsers: user.blockedUsers });
});


const unblockUser = expressAsyncHandler(async (req, res) => {
  const { userToUnblockId } = req.body;
  if (!userToUnblockId) {
    res.status(400);
    throw new Error("User to unblock is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { blockedUsers: userToUnblockId } },
    { new: true }
  );

  res.status(200).json({ message: "User unblocked", blockedUsers: user.blockedUsers });
});
const getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("blockedUsers");
    res.status(200).json({ blockedUsers: user.blockedUsers || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { RegisterUser, authUser, allUsers, blockUser, unblockUser , getBlockedUsers};*/
const expressAsyncHandler = require("express-async-handler");
const User = require('../models/userModel');
const generateToken = require('../config/generateToken');
const crypto = require("crypto");
const sendVerificationEmail = require("../utils/sendMail");

const RegisterUser = expressAsyncHandler(async (req, res) => {
  const { Name, Email, Password, Pic } = req.body;

  if (!Name || !Email || !Password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const userExists = await User.findOne({ Email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const token = crypto.randomBytes(32).toString("hex");

  const user = await User.create({
    Name,
    Email,
    Password,
    Pic,
    verificationToken: token,
    verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000,
  });

  if (user) {
    await sendVerificationEmail(Email, token);
    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account.",
    });
  } else {
    res.status(400);
    throw new Error("Failed to create User");
  }
});

const verifyEmail = expressAsyncHandler(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired verification link");
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Email verified successfully! You can now log in." });
});

const authUser = expressAsyncHandler(async (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const user = await User.findOne({ Email });

  if (!user) {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }

  if (!user.isVerified) {
    res.status(401);
    throw new Error("Please verify your email before logging in");
  }

  if (await user.matchPassword(Password)) {
    res.status(200).json({
      _id: user._id,
      Name: user.Name,
      Email: user.Email,
      Pic: user.Pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

const allUsers = expressAsyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { Name: { $regex: req.query.search, $options: "i" } },
          { Email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.status(200).send(users);
});

const blockUser = expressAsyncHandler(async (req, res) => {
  const { userToBlockId } = req.body;

  if (!userToBlockId) {
    res.status(400);
    throw new Error("User to block is required");
  }

  if (userToBlockId === req.user._id.toString()) {
    res.status(400);
    throw new Error("You cannot block yourself");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { blockedUsers: userToBlockId } },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ message: "User blocked", blockedUsers: user.blockedUsers });
});

const unblockUser = expressAsyncHandler(async (req, res) => {
  const { userToUnblockId } = req.body;

  if (!userToUnblockId) {
    res.status(400);
    throw new Error("User to unblock is required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $pull: { blockedUsers: userToUnblockId } },
    { new: true }
  );

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ message: "User unblocked", blockedUsers: user.blockedUsers });
});

const getBlockedUsers = expressAsyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("blockedUsers");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({ blockedUsers: user.blockedUsers || [] });
});

module.exports = {
  RegisterUser,
  authUser,
  verifyEmail,
  allUsers,
  blockUser,
  unblockUser,
  getBlockedUsers,
};