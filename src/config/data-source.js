const db = require('mongoose')
db.Promise = global.Promise

console.log('Successful database connection...')

const url = process.env.MONGODB_URI ? process.env.MONGODB_URI : 'mongodb://root:mongo1234@localhost:27017/mymoneydb'

module.exports = db.connect(url, { auth: { authdb:"admin" }, useMongoClient: true })

db.Error.messages.general.required = "O atributo '{PATH}' é obrigatório."
db.Error.messages.Number.min = 
    "O '{VALUE}' informado é menor que o limite mínimo de '{MIN}'."
db.Error.messages.Number.max = 
    "O '{VALUE}' informado é maior que o limite máximo de '{MAX}'."
db.Error.messages.String.enum = 
    "'{VALUE}' não é válido para o atributo '{PATH}'."