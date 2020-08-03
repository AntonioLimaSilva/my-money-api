const restful = require('node-restful')

const mongoose = restful.mongoose

const user = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
})

module.exports = restful.model('User', user)