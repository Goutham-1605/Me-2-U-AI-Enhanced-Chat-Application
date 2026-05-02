const express = require('express')
const { protect } = require('../Middlewares/authMiddleware')
const { accesChat , fetchChats, createGroupChat, renameGroup,addToGroup,removeFromGroup, deleteGroupChat, deleteChat} = require('../controllers/chatController')
const router = express.Router()

 router.route('/').post(protect,accesChat)
 router.route('/').get(protect,fetchChats)
 router.route('/group').post(protect,createGroupChat)
 router.route('/rename').put(protect,renameGroup)
 router.route('/groupAdd').put(protect,addToGroup)
 router.route('/groupRemove').put(protect,removeFromGroup)
 router.route('/group/:id').delete(protect, deleteGroupChat);
 router.route('/:chatId').delete(protect, deleteChat);
module.exports=router;