const puppeteer = require('puppeteer')
const express = require('express')
const router = new express.Router()

const config = require('../../config.json')

router.get('/', async (req, res) => {
  let browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
  let page = await browser.newPage()

  await page.goto('http://localhost:' + config.httpPort, { waitUntil: 'networkidle2' })
  let buffer = await page.pdf({format: 'A4'})
  await browser.close()

  res.header('Content-Type', 'application/pdf')
  res.end(buffer)
})

module.exports = router
