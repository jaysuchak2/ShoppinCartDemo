var express = require('express');
var router = express.Router();
const cartModel = require("../models/carts");
const orderModel = require("../models/orders");
const productModel = require("../models/products");
//  Buy product from cart
router.post("/", role.permission("user"), async function (req, res) {
    try {
        let flag = false;
        let products = req.body.products;
        if (products.length > 0) {
            let cart = await cartModel.findOne({
                user: req.user._id
            });
            for (let cartProduct of cart.products) {
                products.map((p) => {
                    if (cartProduct._id == p._id) {
                        flag = true;
                    }
                })
            }
        }
        if (flag) {
            let order = await orderModel.create({
                products: products,
                user: req.user._id
            });
            if (order) {
                for (let p of products) {
                    let updateQty = await productModel.findOneAndUpdate({
                        _id: p._id
                    }, {
                        $inc: {
                            qty: -p.qty
                        }
                    })
                    if(updateQty && updateQty.qty <= 0){
                        res.send({
                            message: updateQty._id + " was out of stock"
                        });
                    }
                    if (updateQty && updateQty.qty > 0) {
                        let cartRemoveProducts = await cartModel.updateOne({
                            user: req.user._id
                        }, {
                            $pull: {
                                products: {
                                    _id: p._id
                                }
                            }
                        });
                    }

                }
                // res.send("Products Order successfully.");
                return res.status(201).send({
                    success: true,
                    message: "Products Order successfully",
                    data: order
                });
            }
        }
        // res.send("Products Order successfully.");
        return res.status(401).send({
            success: false,
            message: "Product is not in cart"
        });
    } catch (error) {
        console.error(error);
        return res.send({
            success: false,
            error: error,
        });
    }
});
//  List Orders
router.get("/", role.permission("admin", "user"), async function (req, res) {
    try {
        let cond = {};
        if (req.user.role == "user") {
            cond["user"] = req.user._id
        }
        let orders = await orderModel.find(cond).populate({
            path: "products._id",
            select: "images price"
        }).lean();
        // res.send(orders);

        res.status(200).send({
            success: true,
            data: orders
        });
    } catch (error) {
        return res.send({
            success: false,
            error: error,
        });
    }
});
module.exports = router;