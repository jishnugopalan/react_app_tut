var express = require('express')
var router = express.Router()
const { check } = require('express-validator')
const { signout, signup, signin, isSignedIn } = require("../controllers/auth")

router.post("/signup", [
    check("name", "Name should be at least 3 char ").isLength({ min: 3 }),
    check("email", "Email is required").isEmail(),
    check("password", "Password should be at least 3 char ").isLength({ min: 3 }),
], signup)

router.post("/signin", [
    check("email", "Email is required").isEmail(),
    check("password", "Password is required").isLength({ min: 3 }),
], signin)




router.get("/signout", signout)




module.exports = router;