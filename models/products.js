const mongoose = require('mongoose');
var schema = new mongoose.Schema({
    images: [{
        type: String,
        required: true
    }],
    price: {
        type: Number,
        required: true
    },
    name: {
        type: String
    },
    qty: {
        type: Number,
        default: 1
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('products', schema);