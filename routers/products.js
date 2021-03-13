var express = require('express');
var router = express.Router();
var multer = require('multer');
const fs = require("fs");
const path = require("path");
const productModel = require("../models/products");

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now());
    }
});
// for upload max 5 images
var upload = multer({
    storage: storage
}).array('images', 5);

//  Delete images
function deleteFiles(files, callback) {
    var i = files.length;
    files.forEach(function (filepath) {
        fs.unlink(filepath, function (err) {
            i--;
            if (err) {
                callback(err);
                return;
            } else if (i <= 0) {
                callback(null);
            }
        });
    });
}
//  Create / Add Product
router.post('/', role.permission("admin"), function (req, res) {
    try {
        upload(req, res, async function (err) {
            if (err) {
                return res.end("Error uploading file." + err);
            }
            let productData = {
                price: req.body.price,
                qty: req.body.qty,
                user: req.user._id,
                name: req.body.name
            };
            if (req.files && req.files.length > 0) {
                productData["images"] = req.files.map(((files) => {
                    return files.filename
                }));
            }
            console.log(productData);
            let product = await productModel.create(productData);
            // res.end("Product is added");
            return res.send({
                success: true,
                message: "Product is added",
                data: product
            });
        });
    } catch (error) {
        return res.send({
            success: false,
            error: error,
        });
    }
});
//  List Products
router.get('/', role.permission('admin', 'user'), async function (req, res) {
    try {
        let products = await productModel.find().lean();
        // res.render('products', {
        //     products: products
        // });
        // res.send(products);
        res.status(200).send({
            success: true,
            data: products
        });
    } catch (error) {
        return res.send({
            success: false,
            error: error
        });
    }
});
//  View Product
router.get('/:id', role.permission("admin", "user"), async function (req, res) {
    try {
        let product = await productModel.findOne({
            _id: req.params.id
        }).lean();
        res.status(200).send({
            success: true,
            data: product
        });
    } catch (error) {
        return res.send({
            success: false,
            error: error
        });
    }
});
//  Remove Product
router.delete('/:id', role.permission("admin"), async function (req, res) {
    try {
        let del = await productModel.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });
        if (!del) {
            return res.status(404).send({
                success: true,
                message: "Product not found"
            });
        }
        if (del.images.length > 0) {
            const images = del.images.map(file => {
                const dest = path.join(__dirname, `../public/uploads/`);
                return dest + file;
            });
            if (images.length > 0) {
                deleteFiles(images, (err) => {
                    if (err) {
                        console.log(err);
                        return res.json({
                            success: false,
                            error: "file deletion error!"
                        });
                    }
                });
            }
        }
        if (del) {
            // res.send("Product is deleted");
            return res.status(202).send({
                success: true,
                message: "Product is deleted"
            });
        }
    } catch (error) {
        return res.send({
            success: false,
            error: error
        });
    }
});
//  Update Product
router.put('/:id', role.permission("admin"), async function (req, res) {
    try {
        let update;
        let product = await productModel.findOne({
            _id: req.params.id,
            user: req.user._id
        });
        if (product && product.images.length > 0) {
            const images = product.images.map(file => {
                const dest = path.join(__dirname, `../public/uploads/`);
                return dest + file;
            });
            if (images.length > 0) {
                deleteFiles(images, (err) => {
                    if (err) {
                        return res.send({
                            success: false,
                            error: "file deletion error!"
                        });
                    }
                });
            }
        }
        upload(req, res, async function (err) {
            if (err) {
                return res.end({
                    success: false,
                    error: "Error uploading file." + err
                });
            }
            if (req.files.length > 0) {
                update = await productModel.findByIdAndUpdate({
                    _id: req.params.id,
                    user: req.user._id
                }, {
                    $set: {
                        images: req.files.map(((files) => {
                            return files.filename
                        })),
                        price: req.body.price,
                        qty: req.body.qty,
                        name: req.body.name
                    }
                });
            } else {
                update = await productModel.findByIdAndUpdate({
                    _id: req.params.id,
                    user: req.user._id
                }, {
                    $set: req.body
                });
            }
            if (update) {
                res.status(202).send({
                    success: true,
                    message: "Product is Updated"
                });
            } else {
                res.status(202).send({
                    success: false,
                    message: "Product is Not Updated"
                });
            }
        });
    } catch (error) {
        console.log(error);
        return res.send({
            success: false,
            error: error
        });
    }
});
module.exports = router;