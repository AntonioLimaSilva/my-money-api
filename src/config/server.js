const env = require('../env/environment')
const port = env.port

const bodyParser = require('body-parser')
const queryParser = require('express-query-int')
const express = require('express')
const server = express()
server.disable("x-powered-by");

const allowCors = require('./cors')

server.use(bodyParser.urlencoded({ extended: true }))
server.use(queryParser())
server.use(bodyParser.json())
server.use(allowCors)

server.listen(port, () => {
    console.log(`BACKEND is running in port ${port}`)
})

module.exports = server