const express = require ('express')
const router = express.Router();
const { getMe, updateMe } = require("../controllers/profile.controller")
const auth = require("../middleware/auth.middleware")



//Fetch user profile
router.get('/me', auth, getMe);


//update user information
router.patch('/updateProfile', auth, updateMe);

module.exports = router