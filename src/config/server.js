const port = process.env.PORT || 5000

const bodyParser = require('body-parser')
const queryParser = require('express-query-int')
const express = require('express')
const server = express()

const allowCors = require('./cors')

server.use(bodyParser.urlencoded({ extended: true }))
server.use(queryParser())
server.use(bodyParser.json())
server.use(allowCors)

server.listen(port, () => {
    console.log(`BACKEND is running in port ${port}`)
})

module.exports = server