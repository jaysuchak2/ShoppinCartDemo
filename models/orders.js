const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    products: [{
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model("orders", orderSchema);