const db = require('mongoose')
db.Promise = global.Promise

console.log('Successful database connection...')

module.exports = db.connect('mongodb://root:mongo1234@localhost:27017/mymoneydb', {
    auth: { authdb:"admin" }
})