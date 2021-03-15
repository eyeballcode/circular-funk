const express = require('express')
const router = new express.Router()
const moment = require('moment')
const config = require('../../config.json')
const DatabaseConnection = require('../../database/DatabaseConnection')

const database = new DatabaseConnection(config.databaseURL, config.databaseName)
database.connect(async () => {})

function formatDate(date) {
  return date.format('DD-MM-YYYY')
}

function pad(data, length, filler='0') {
  return Array(length).fill(filler).concat([...data.toString()]).slice(-length).join('')
}

function getHHMMFromMinutesPastMidnight(time) {
  let hours = Math.floor(time / 60)
  let minutes = time % 60
  let mainTime = ''

  hours %= 24
  if (hours < 10) mainTime += '0'
  mainTime += hours
  mainTime += ' '
  if (minutes < 10) mainTime += '0'
  mainTime += minutes

  return mainTime
}

function getStop(trip, stop) {
  let fullStop = stop + ' Railway Station'
  return trip.stopTimings.find(stop => stop.stopName === fullStop)
}

let abbreviations = {
  'Flinders Street': 'FSS',
  'Pakenham East': 'PKE'
}

router.get('/', async  (req, res) => {
  let writtenAt = moment().add(-31 + 7 * (Math.random() - 0.5), 'days')
  let startOfYear = writtenAt.clone().startOf('year')
  let dayCount = writtenAt.diff(startOfYear, 'days')
  let year = writtenAt.get('year').toString().slice(-2)

  let circularNumber = Math.max(Math.ceil(9999 * dayCount / (365 * 2) + 100 * (Math.random() - 0.5)), 0)

  let intendedFor = moment()
  let dayOfWeek = intendedFor.get('day')
  let dayNames = [], days = []

  if (dayOfWeek === '0') {
    dayNames = ['SUNDAY']
    days = [formatDate(intendedFor)]
  } else {
    dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    let startOfWeek = intendedFor.clone().startOf('week')
    for (let i = 0; i < 5; i++) {
      days.push(formatDate(startOfWeek.clone().add(i, 'days')))
    }
  }

  let hcmtTrainsToday = await database.getCollection('live timetables').findDocuments({
    mode: 'metro train',
    operationDays: intendedFor.format('YYYYMMDD'),
    routeGTFSID: '2-PKM',
    h: true
  }).sort({ departureTime: 1 }).toArray()

  hcmtTrainsToday.forEach(train => {
    train.stopTimings.forEach(stop => stop.departureTime = stop.departureTime.replace(':', ' '))
  })

  let formings = hcmtTrainsToday.map(train => train.forming).filter(Boolean)

  let upTrips = hcmtTrainsToday.filter(trip => trip.direction === 'Up')
  let downTrips = hcmtTrainsToday.filter(trip => trip.direction === 'Down')

  upTrips.forEach(upTrip => {
    let pkm = getStop(upTrip, 'Pakenham')
    let pke = {
      stopName: 'Pakenham East Railway Station',
      departureTime: getHHMMFromMinutesPastMidnight(pkm.departureTimeMinutes - 6),
      departureTimeMinutes: pkm.departureTimeMinutes - 6,
      platform: 'DEP'
    }

    pkm.track = 'S'

    let cfd = getStop(upTrip, 'Caulfield')
    let syr = getStop(upTrip, 'South Yarra')
    let rmd = getStop(upTrip, 'Richmond')
    let par = getStop(upTrip, 'Parliament')
    let sss = getStop(upTrip, 'Southern Cross')

    if (syr.platform === '5') cfd.track = 'CL'
    else cfd.track = 'CT'
    rmd.track = cfd.track
    sss.track = 'CV'

    let rmj = {
      stopName: 'Richmond Junction Railway Station',
      departureTime: getHHMMFromMinutesPastMidnight(rmd.departureTimeMinutes + 1),
      departureTimeMinutes: rmd.departureTimeMinutes + 1,
      express: true,
      track: par ? 'CU' : 'CL'
    }

    upTrip.stopTimings.push(pke)
    upTrip.stopTimings.push(rmj)
    upTrip.stopTimings = upTrip.stopTimings.sort((a, b) => a.departureTimeMinutes - b.departureTimeMinutes)
  })

  downTrips.forEach(downTrip => {
    let pkm = getStop(downTrip, 'Pakenham')
    let pke = {
      stopName: 'Pakenham East Railway Station',
      departureTime: getHHMMFromMinutesPastMidnight(pkm.departureTimeMinutes + 5),
      departureTimeMinutes: pkm.departureTimeMinutes + 5,
      platform: 'ARR'
    }

    pkm.track = 'N'

    let rmd = getStop(downTrip, 'Richmond')
    if (rmd.platform === '6') rmd.track = 'CL'
    else rmd.track = 'CT'

    let rmj = {
      stopName: 'Richmond Junction Railway Station',
      departureTime: getHHMMFromMinutesPastMidnight(rmd.departureTimeMinutes - 2),
      departureTimeMinutes: rmd.departureTimeMinutes - 2,
      express: true,
      track: rmd.track
    }

    downTrip.stopTimings.push(pke)
    downTrip.stopTimings.push(rmj)
    downTrip.stopTimings = downTrip.stopTimings.sort((a, b) => a.departureTimeMinutes - b.departureTimeMinutes)
  })

  hcmtTrainsToday.forEach(trip => {
    if (formings.includes(trip.runID)) {
      let formedBy = hcmtTrainsToday.find(train => train.forming === trip.runID)

      trip.formedBy = `${formedBy.runID}<br>
      ${formedBy.stopTimings.slice(-1)[0].departureTime}<br>
      ${abbreviations[formedBy.stopTimings[0].stopName.slice(0, -16)]}`
    } else trip.formedBy = 'ON'

    if (trip.forming) {
      let forming = hcmtTrainsToday.find(train => train.runID === trip.forming)

      trip.forms = `${forming.runID}<br>
      ${forming.stopTimings[0].departureTime}<br>
      ${abbreviations[forming.stopTimings.slice(-1)[0].stopName.slice(0, -16)]}`
    } else trip.forms = 'OFF'
  })

  let upStopNames = upTrips[0].stopTimings.map(stop => stop.stopName.slice(0, -16))
  let downStopNames = downTrips[0].stopTimings.map(stop => stop.stopName.slice(0, -16))

  res.render('hcmt', {
    circular: pad(circularNumber, 4),
    year,
    writtenAt,
    dayNames,
    days,
    trips: {
      upTrips, downTrips, trips: hcmtTrainsToday,
      upStopNames, downStopNames
    }
  })
})

module.exports = router
