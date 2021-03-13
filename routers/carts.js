var express = require('express');
var router = express.Router();
const cartModel = require("../models/carts");
const productModel = require("../models/products");

//  Add / Update cart
router.post("/", role.permission("user"), async function (req, res) {
    try {
        //  Find products
        let products = await productModel.find({
            _id: {
                $in: req.body.products.map((p) => {
                    return p._id;
                })
            },
            qty: {
                $gte: 1
            }
        });
        // If no products found
        if (products.length == 0) {
            // return res.send("Products Not Found");
            return res.status(404).send({
                success: false,
                message: "Products Not Found or Out of stock"
            });
        }
        let cartFound = await cartModel.findOne({
            user: req.user._id
        });
        if (!cartFound) {
            let cart = await cartModel.create({
                user: req.user._id,
                products: products
            });
            if (cart) {
                // res.send("Added to cart");
                return res.status(201).send({
                    success: true,
                    data: cart,
                    message: "Added to cart"
                });
            } else {
                return res.status(400).send({
                    success: false,
                    data: cart,
                    message: "Error: In Cart"
                });
                // return res.send("Error: In Cart");
            }
        } else {
            let cartUpdate = await cartModel.updateOne({
                user: req.user._id
            }, {
                $addToSet: {
                    products: products
                }
            });
            if (cartUpdate.n > 0) {
                return res.status(202).send({
                    success: true,
                    message: "Cart is updated"
                });
                // return res.send("Cart is updated");
            }
        }
    } catch (error) {
        return res.send({
            success: false,
            error: error,
        });
    }
});

//  List Cart
router.get("/", role.permission("user"), async function (req, res) {
    try {
        let cond = {};
        if (req.user.role == "user") {
            cond["user"] = req.user._id
        }
        let cart = await cartModel.find(cond).populate({
            path: "products._id",
            select: "images price"
        }).lean();
        if (cart.length > 0) {
            // res.send(cart);
            return res.status(200).send({
                success: true,
                data: cart
            });
        } else {
            // return res.send("Cart is empty");
            return res.status(200).send({
                success: true,
                data: cart,
                message: "Cart is empty"
            });

        }
    } catch (error) {
        return res.send({
            success: false,
            error: error,
        });
    }
});
//  Remove Product from cart
router.delete("/", role.permission("user"), async function (req, res) {
    try {
        //  Find products
        let product = await productModel.findOne({
            _id: req.body.product
        });

        let cart = await cartModel.findOne({
            user: req.user._id
        });

        if (cart) {
            let cartRemoveProducts = await cartModel.updateOne({
                user: req.user._id
            }, {
                $pull: {
                    products: {
                        _id: product._id
                    }
                }
            });

            if (cartRemoveProducts.n > 0) {
                // return res.send(product._id + " Product Removed from cart");
                return res.status(202).send({
                    success: true,
                    data: product,
                    message: "Product Removed from cart"
                });
            } else {
                // return res.send("This Product is added in cart");
                return res.status(400).send({
                    success: false,
                    data: product,
                    message: "This Product is not added in cart"
                });
            }
        }
        return res.status(400).send({
            success: false,
            message: "Cart not found"
        });
    } catch (error) {
        return res.send({
            success: false,
            error: error,
        });
    }
})
module.exports = router;