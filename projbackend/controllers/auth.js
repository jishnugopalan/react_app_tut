const User = require("../models/user");
const { check, validationResult } = require('express-validator');
const user = require("../models/user");
var jwt = require('jsonwebtoken');
var expresJwt = require('express-jwt')

//const bcrypt = require("bcrypt")

exports.signup = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({
            error: errors.array()[0].msg
        })
    }

    const user = new User(req.body);

    console.log(req.body)
    user.save((err, user) => {
        if (err) {
            console.log(err)
            return res.status(400).json({
                err: "NOT able to save user in DB"
            });
        }
        res.json({
            name: user.name,
            email: user.email,
            id: user._id
        });
    });
};

exports.signout = (req, res) => {
    res.clearCookie("token");
    res.json({
        message: "User signout"
    });
};

exports.signin = (req, res) => {
        const errors = validationResult(req)
        const { email, password } = req.body;
        if (!errors.isEmpty()) {
            return res.status(422).json({
                error: errors.array()[0].msg
            })
        }
        User.findOne({ email }, (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: "No email"
                })
            }
            if (!user.authenticate(password)) {
                return res.status(401).json({
                    error: "Email and password do not match"
                })

            }

            const token = jwt.sign({ _id: user._id }, process.env.SECRET)
            res.cookie("token", token, { expire: new Date() + 999 })
            const { _id, name, email, role } = user;
            return res.json({ token, user: { _id, name, email, role } })

        })

    }
    //protected routes
exports.isSignedIn = expresJwt({
    secret: process.env.SECRET,
    userProperty: "auth"
});

//custom middlewar
exports.isAuthenticated = (req, res, next) => {
    console.log(req.auth._id)
    let checker = req.profile && req.auth && req.profile._id == req.auth._id
    if (!checker) {
        return res.status(403).json({
            error: "Access denied"
        })
    }
    next()
}

exports.isAdmin = (req, res, next) => {
    if (req.profile.role === 0) {
        return res.status(403).json({
            error: "Access denined"
        })
    }
    next()
}