const mongoose = require('mongoose')
const { Schema } = mongoose
const passportLocalMongoose = require('passport-local-mongoose');
const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    watchlist: {
        type: [String]
    }
})
userSchema.plugin(passportLocalMongoose);
module.exports.User = mongoose.model('User', userSchema)