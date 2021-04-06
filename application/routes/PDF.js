const puppeteer = require('puppeteer')
const express = require('express')
const router = new express.Router()

const config = require('../../config.json')

router.get('/', async (req, res) => {
  let browser
  try {
    browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
    let page = await browser.newPage()

    await page.goto('http://localhost:' + config.httpPort, { waitUntil: 'networkidle0' })
    let buffer = await page.pdf({format: 'A4'})

    res.header('Content-Type', 'application/pdf')
    res.end(buffer)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
})

router.get('/hcmt', async (req, res) => {
  let browser
  try {
    browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
    let page = await browser.newPage()

    await page.goto('http://localhost:' + config.httpPort + '/hcmt', { waitUntil: 'networkidle0' })
    let buffer = await page.pdf({format: 'A4', printBackground: true})
    let circularNumber = await page.$eval('title', el => el.textContent)

    res.header('Content-Type', 'application/pdf')
    res.header('Content-Disposition', `attachment; filename="${circularNumber}.pdf"`)
    res.end(buffer)
  } finally {
    if (browser) {
      await browser.close()
    }
  }
})

module.exports = router
