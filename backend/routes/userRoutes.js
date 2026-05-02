const express  = require('express')
const { RegisterUser, authUser, allUsers, blockUser, unblockUser, getBlockedUsers, verifyEmail } = require('../controllers/userController')
const { protect } = require('../Middlewares/authMiddleware')

const router = express.Router()

 router.route('/').post(RegisterUser).get(protect,allUsers)
 router.post('/login', authUser) 
 router.put('/block', protect, blockUser);     
router.put('/unblock', protect, unblockUser);
router.get('/blockedUsers', protect, getBlockedUsers);
router.get('/verify-email/:token', verifyEmail);

;
module.exports= router;