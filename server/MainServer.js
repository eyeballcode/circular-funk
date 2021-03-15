const express = require('express')
const bodyParser = require('body-parser')
const url = require('url')
const path = require('path')
const fs = require('fs')
const config = require('../config.json')

module.exports = class MainServer {
  constructor () {
    this.app = express()
    this.configMiddleware(this.app)
    this.configRoutes(this.app)
  }

  configMiddleware (app) {
    app.use((req, res, next) => {
      let reqURL = req.url + ''
      let start = +new Date()

      let endResponse = res.end
      res.end = (x, y, z) => {
        endResponse.bind(res, x, y, z)()
        let end = +new Date()
        let diff = end - start

        if (diff > 20 && !reqURL.startsWith('/static/')) {
          console.info(`${req.method} ${reqURL}${res.loggingData ? ` ${res.loggingData}` : ''} ${diff}`)
        }
      }

      next()
    })

    app.use('/static', express.static(path.join(__dirname, '../application/static'), {
      maxAge: 0
    }))

    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(bodyParser.text())

    app.set('views', path.join(__dirname, '../application/views'))
    app.set('view engine', 'pug')
    app.set('x-powered-by', false)
    app.set('strict routing', false)
  }

  async configRoutes (app) {
    app.use('/', require('../application/routes/Generate'))
    app.use('/hcmt', require('../application/routes/GenerateHCMT'))
    app.use('/pdf', require('../application/routes/PDF'))

    app.use('/500', (req, res) => { throw new Error('500') })

    app.use((req, res, next) => {
      next(new Error('404'))
    })

    app.use((err, req, res, next) => {
      if (err.message === '404') {
        res.status(400).end('404')
        // res.status(404).render('errors/404')
      } else {
        res.status(500).end('500')
        // res.status(500).render('errors/500')
        console.log(req.url, err)
      }
    })
  }
}
