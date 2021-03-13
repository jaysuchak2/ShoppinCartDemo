const mongoose = require('mongoose');
var schema = new mongoose.Schema({
    username: {
        type: String,
        unique: true
    },
    email:{
        type: String,
        unique: true
    },
    password: 'string',
    firstName: 'string',
    lastName: 'string',
    role: {
        type: String,
        default: "user",
        enum: ['admin', 'user']
    }
}, {
    timestamps: true
});
module.exports = mongoose.model('users', schema);