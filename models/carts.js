const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        unique: true
    },
    products: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true
        }
    }],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("carts", CartSchema);