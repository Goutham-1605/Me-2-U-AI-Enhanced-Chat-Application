const express = require('express');
const { protect } = require('../Middlewares/authMiddleware');
const {
  sendMessage,
  allMessages,
  editMessage,
  deleteMessage,
  pinMessage,
  getPinnedMessage,
} = require('../controllers/messageController');

const router = express.Router();

router.route('/').post(protect, sendMessage);
router.route('/pin').post(protect, pinMessage);
router.route('/pin/:chatId').get(protect, getPinnedMessage);

router.route('/:chatId').get(protect, allMessages);
router.route('/:id/edit').put(protect, editMessage);
router.route('/:id/delete').delete(protect, deleteMessage);

module.exports = router;