const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

router.get('/me', userController.getMe);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

module.exports = router;
