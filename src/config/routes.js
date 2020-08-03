const express = require('express')
const auth = require('./auth')

module.exports = (server) => {

    const protectedApi = express.Router()
    server.use('/api', protectedApi)
    protectedApi.use(auth)

    const billingCycles = require('../main/service/billing-cycle-service')
    const user = require('../main/service/user-service')
    billingCycles.register(protectedApi, '/billingCycles')
    protectedApi.route('/signup').post(user.signup)
    protectedApi.route('/users').put(user.update)
    protectedApi.route('/users').get(user.findByEmail)

    const openApi = express.Router()
    server.use('/open-api', openApi)

    const authService = require('../main/service/auth-service')
    openApi.route('/login').post(authService.login)
    openApi.route('/validateToken').post(authService.validateToken)

}