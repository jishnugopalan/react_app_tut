const Product = require("../models/product")
const formidable = require("formidable")
const _ = require("lodash")
const fs = require("fs")
const { sortBy } = require("lodash")
    //const product = require("../models/product")



exports.getProductById = (req, res, next, id) => {
    Product.findById(id)
        .populate("category")
        .exec((err, product) => {
            if (err) {
                return res.status(400).json({
                    error: "Product not found"
                });
            }
            req.product = product;
            next();
        });
};

exports.createProduct = (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                error: "Problem with image"
            })
        }

        //destructuring
        const { name, description, price, category, stock } = fields

        if (!name || !description || !price || !category || !stock) {
            if (err) {
                return res.status(400).json({
                    error: "Pleade include all field"
                })
            }
        }



        let product = new Product(fields)

        //file handle
        if (file.photo) {
            if (file.photo.size > 3000000) {
                return res.status(400).json({
                    error: "File size is too big"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.type
        }

        //save to db
        product.save((err, product) => {
            if (err) {
                return res.status(400).json({
                    error: "saving to db is failed"
                })


            }
            res.json(product)
        })
    })

}

exports.getProduct = (req, res) => {

    req.product.photo = undefined

    return res.json(req.product)
}

exports.photo = (req, res, next) => {
        if (req.product.photo.data) {

            res.set("Content-Type", req.product.photo.contentType)
            return res.send(req.product.photo.data)
        }
        next()
    }
    //delete 

exports.deleteProduct = (req, res) => {
    console.log(req.params.productId);
    let product = req.params.productId;
    //console.log(productId)
    Product.deleteOne({ _id: product }).exec((err, deletedProduct) => {
        if (err) {
            return res.status(400).json({
                error: "Failed to delete the product"
            });
        }
        res.json({
            message: "Deletion was a success",
            deletedProduct
        });
    });
};

//update

exports.updateProduct = (req, res) => {


    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, file) => {
        if (err) {
            return res.status(400).json({
                error: "Problem with image"
            })
        }

        //destructuring
        const { name, description, price, category, stock } = fields

        if (!name || !description || !price || !category || !stock) {
            if (err) {
                return res.status(400).json({
                    error: "Pleade include all field"
                })
            }
        }


        //updation code
        let product = req.product
        product = _.extend(product, fields)

        //file handle
        if (file.photo) {
            if (file.photo.size > 3000000) {
                return res.status(400).json({
                    error: "File size is too big"
                })
            }
            product.photo.data = fs.readFileSync(file.photo.path)
            product.photo.contentType = file.photo.type
        }

        //save to db
        product.save((err, product) => {
            if (err) {
                return res.status(400).json({
                    error: "Updation is failed"
                })


            }
            res.json(product)
        })
    })


}

//product listing

exports.getAllProducts = (req, res) => {
    let limit = req.query.limit ? parseInt(req.query.limit) : 8
    let sortBy = req.query.sortBy ? req.query.sortBy : "_id"
    Product.find()
        .select("-photo")
        .populate("category")
        .sort([
            [sortBy, "asc"]
        ])
        .limit(limit)
        .exec((err, products) => {
            if (err) {
                return res.status(400).json({
                    error: "No product found"
                })
            }
            res.json(products)
        })

}

exports.updateStock = (req, res, next) => {

    let myOperation = req.body.order.products.map(prod => {
        return {
            updateOne: {
                filter: { _id: prod._id },
                update: { $inc: { stock: -prod.count, sold: +prod.count } }
            }
        }
    })

    Product.bilkWrite(myOperation, {}, (err, products) => {
        if (err) {
            return res.status(400).json({
                error: "Bulk operation failed"
            })
        }
        next()
    })




}

exports.getAllUniqueCategory = (req, res) => {
    Product.distinct("category", {}, (err, category) => {
        if (err) {
            return res.status(400).json({
                error: "No actegory found"
            })
        }
        res.json(category)

    })

}