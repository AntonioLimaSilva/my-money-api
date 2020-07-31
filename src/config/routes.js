const express = require('express')
const auth = require('./auth')

module.exports = (server) => {

    const protectedApi = express.Router()
    server.use('/api', protectedApi)
    protectedApi.use(auth)

    const billingSicle = require('../main/service/billing-cycle-service')
    const user = require('../main/service/user-service')
    billingSicle.register(protectedApi, '/billingCycles')
    protectedApi.post('/signup', user.signup)
    protectedApi.put('/users', user.update)
    protectedApi.get('/users', user.findByEmail)
    

    const openApi = express.Router()
    server.use('/open-api', openApi)

    const authService = require('../main/service/auth-service')
    openApi.post('/login', authService.login)
    openApi.post('/validateToken', authService.validateToken)

}