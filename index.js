const config = require('./config.json')
const HTTPServer = require('./server/HTTPServer')
const MainServer = require('./server/MainServer')

const path = require('path')

let mainServer = new MainServer()
let httpServer = HTTPServer.createServer(mainServer)

httpServer.listen(config.httpPort)

console.log('Server Started')

process.on('uncaughtException', err => {
  console.err(err)
})

console.err = console.error
