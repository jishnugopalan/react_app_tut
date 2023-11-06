const express = require("express")
const router = express.Router()
const { getUserById, getUser, updateUser, userPurhaseList } = require("../controllers/user")
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth")
router.param("userId", getUserById)

router.get("/user/:userId", isSignedIn, isAuthenticated, getUser);
console.log('in')
router.put("/user/:userId", isSignedIn, isAuthenticated, updateUser)
router.get("/orders/:userId", isSignedIn, isAuthenticated, userPurhaseList)
    //router.post("user/:userId", updateUser)



module.exports = router