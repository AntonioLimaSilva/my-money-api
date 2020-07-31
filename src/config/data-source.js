const db = require('mongoose')
const env = require('../env/environment')
db.Promise = global.Promise

console.log('Successful database connection...')

module.exports = db.connect(env.url, {auth: { authdb:"admin" }, useMongoClient: true })

db.Error.messages.general.required = "O atributo '{PATH}' é obrigatório."
db.Error.messages.Number.min = "O '{VALUE}' informado é menor que o limite mínimo de '{MIN}'."
db.Error.messages.Number.max = "O '{VALUE}' informado é maior que o limite máximo de '{MAX}'."
db.Error.messages.String.enum = "'{VALUE}' não é válido para o atributo '{PATH}'."