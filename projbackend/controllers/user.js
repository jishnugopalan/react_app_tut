//const user = require("../models/user")
const user = require("../models/user")
const User = require("../models/user")
const Order = require('../models/order')
    //const { user } = require("../routes/auth")



exports.getUserById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: "No user"
            })
        }
        req.profile = user
        next();
    })
}
exports.getUser = (req, res) => {



    req.profile.salt = undefined;
    req.profile.encry_password = undefined;


    return res.json(req.profile)
}

exports.updateUser = (req, res) => {
    console.log(req.body)
    User.findOneAndUpdate({
        _id: req.profile._id
    }, {
        $set: req.body
    }, {
        new: true,
        useFindAndModify: false
    }, (err, user) => {
        if (err) {
            return res.status(400).json({
                error: "U sre no authurized"
            })

        }
        user.salt = undefined;
        user.encry_password = undefined;
        res.json(user)
    })
}

exports.userPurhaseList = (req, res) => {
    Order.find({ user: req.profile._id }).populate("user", "_id name").exec((err, order) => {
        if (err) {
            return res.status(400).json({
                error: "No order"
            })
        }
        return res.json(order)
    })

}

exports.pushOrderInPurchaseList = (req, res, next) => {
    let purchases = []
    req.body.order.products.forEach(product => {
            purchases.push({
                _id: product._id,
                name: product.name.name,
                description: product.description,
                quantity: product.quantity,
                amount: req.body.order.amount,
                transaction_id: req.body.order.transaction_id
            })

        }),
        User.findOneAndUpdate(

            { _id: req.profile._id }, { $push: { prurchases: purchases } }, { new: true },
            (err, purchases) => {
                if (err) {
                    return res.status(400).json({
                        error: "Unable to save"
                    })
                }

            }, ),



        next()

}