var mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({

    NameSurname: {
        type: String
    },
    Email: {
        type: String
    },
    Username: {
        type: String
    },
    Password: {
        type: String
    },
    ProfilePicture: {
        type: String
    },
    BirthDate: {
        type: Date
    },
    BGColor: {
        type: String
    },
    BGColorButton: {
        type: String
    },
    Links: {
        Links: {Object}
    },



})
const User = mongoose.model('User', userSchema)

module.exports = User;