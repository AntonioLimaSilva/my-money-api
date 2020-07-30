const server = require('./config/server')
require('./config/data-source')
require('./config/routes')(server)