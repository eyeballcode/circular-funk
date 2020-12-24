const express = require('express')
const router = new express.Router()
const moment = require('moment')
const allLines = require('../../lines')

function shuffle(array) {
  let j, x, i
  for (i = array.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = array[i]
    array[i] = array[j]
    array[j] = x
  }

  return array
}

function pickRandom(array) {
  return shuffle(array)[0]
}

function formatHHMM(time) {
  let hours = Math.floor(time / 60)
  let minutes = time % 60
  let mainTime = ''

  hours %= 24
  if (hours < 10) mainTime += '0'
  mainTime += hours
  mainTime += ':'
  if (minutes < 10) mainTime += '0'
  mainTime += minutes

  return mainTime
}

let lines = [
  'Alamein',
  'Belgrave',
  'Craigieburn',
  'Cranbourne',
  'Flemington Racecourse', // No FKN as its part of STY
  'Glen Waverley',
  'Hurstbridge',
  'Lilydale',
  'Mernda',
  'Pakenham',
  'Sandringham',
  'Stony Point',
  'Sunbury',
  'Upfield',
  'Werribee',
  'Williamstown'
]

let dieselLocomotives = [
  'A66',
  'T357',
  'N451',
  'N452',
  'N454',
  'N455',
  'N456',
  'N457',
  'N458',
  'N459',
  'N460',
  'N461',
  'N462',
  'N464',
  'N465',
  'N466',
  'N467',
  'N468',
  'N469',
  'N470',
  'N471',
  'N472',
  'N473',
  'N474'
]

let hcmts = []

for (let i = 2; i <= 65; i++) {
  hcmts.push(`HCMT ${i}`)
}

function fillOut(lore) {
  let loreText = lore.lore
  let title = lore.title
  let consist = lore.consist

  let linesAvailable = shuffle(lines).slice(0, 26)
  let dieselLocomotivesAvailable = shuffle(dieselLocomotives).slice(0, 26)
  let hcmtsAvailable = shuffle(hcmts).slice(0, 26)

  for (let n = 0; n < linesAvailable.length; n++) {
    let regex = new RegExp(`#{line_${String.fromCharCode(97 + n)}}`, 'g')
    loreText = loreText.replace(regex, linesAvailable[n])
    title = title.replace(regex, linesAvailable[n])
  }

  for (let n = 0; n < dieselLocomotivesAvailable.length; n++) {
    let regex = new RegExp(`#{diesel_loco_${String.fromCharCode(97 + n)}}`, 'g')
    loreText = loreText.replace(regex, dieselLocomotivesAvailable[n])
    title = title.replace(regex, dieselLocomotivesAvailable[n])
    consist = consist.replace(regex, dieselLocomotivesAvailable[n])
  }

  for (let n = 0; n < hcmtsAvailable.length; n++) {
    let regex = new RegExp(`#{hcmt_${String.fromCharCode(97 + n)}}`, 'g')
    loreText = loreText.replace(regex, hcmtsAvailable[n])
    title = title.replace(regex, hcmtsAvailable[n])
    consist = consist.replace(regex, hcmtsAvailable[n])
  }

  let now = moment()
  let futureDay = now.add(2 + Math.random() * 10, 'days')

  loreText = loreText.replace(new RegExp(`#{future_day}`, 'g'), futureDay.format('dddd, MMMM Do YYYY'))
  title = title.replace(new RegExp(`#{future_day}`, 'g'), futureDay.format('dddd, MMMM Do YYYY'))

  return {
    ...lore,
    title,
    lore: loreText,
    consist,
    lines: linesAvailable
  }
}

let metroLores = [{
  title: 'IEV102 Overhead Inspection Run',
  lore: 'The Infrastructure Evaluation Vehicle (IEV 102) is a purpose built overhead inspection Vehicle. It is fitted with two pantographs and an observation platform. The vehicle is designed to allow monitoring of contact wire height and stagger and also inspect the overhead traction network at normal line speed to ensure safe and effective operation of the traction network.',
  consist: '#{diesel_loco_a}, IEV 102, #{diesel_loco_b} (push/pull)',
  nonRevenue: true,
  times: ['a.down', 'a.up'],
  tdnRange: 7000
}, {
  title: '#{diesel_loco_a} "The #{line_a}sider" Heritage Run to #{line_a}',
  lore: 'V/Line Victoria will be operating a heritage train to #{line_a} on #{future_day} as part of it\'s celebrations of #{diesel_loco_a}\'s birthday. As part of the tour, #{diesel_loco_a} will visit various locations along the #{line_a} line. The train will also visit #{line_b} and #{line_c} as part of its tour. This heritage train will be filled with foamers and twelvies to raise revenue.',
  consist: '#{diesel_loco_a}, #{diesel_loco_b}, #{diesel_loco_c}, BTH162, BH149, BIH184, BH142, BIH182, BCH122',
  nonRevenue: true,
  starting: 'Down',
  times: ['a.down', 'a.up', 'b.down', 'b.up', 'c.down', 'c.up'],
  tdnRange: 8000
}, {
  title: 'Introduction of HCMT to Revenue Services',
  lore: 'After months of extensive testing the Metro HCMT fleet has finally been approved for revenue service on the #{line_a} and #{line_b} lines. The HCMTs will be entering service on #{future_day}, running from #{line_a} to Flinders Street and return. The HCMT will run one (1) revenue trip before returning to the depot for a media briefing. Staff are to be stationed at the platform to clear out the train upon arrival.',
  consist: '#{hcmt_a}',
  nonRevenue: false,
  starting: 'Up',
  times: ['a.up', 'a.down', 'a.up', 'a.down'],
  tdnRange: 7000
}]

function generateTimes(numberOfStops, startTimeMinutes) {
  let times = [Math.round(startTimeMinutes)]
  let currentTime = startTimeMinutes
  for (let i = 1; i < numberOfStops; i++) {
    let increment = 1 + Math.random() * 4
    let newTime = currentTime + increment
    times.push(Math.round(newTime))
    currentTime = newTime
  }

  return times
}

router.get('/', (req, res) => {
  let circularNumber = Math.ceil(Math.random() * 9999)

  let lore = fillOut(pickRandom(metroLores))
  let currentStart = Math.round(7 * 60 + Math.random() * 60)

  let trips = lore.times.map(trip => {
    let [lineCode, direction] = trip.split('.')
    let lineName = lore.lines[lineCode.charCodeAt(0) - 97]
    let lineStops = allLines[lineName].slice(0)

    let tripStops = lineStops
    if (direction === 'up') tripStops.reverse()

    let times = generateTimes(tripStops.length, currentStart)

    let endTime = times[times.length - 1]
    let newStart = endTime + 3 + Math.random() * 5

    currentStart = newStart

    let tdn = lore.tdnRange + Math.round(Math.random() * 998)
    tdn -= tdn % 2

    if (direction === 'down') tdn++

    return {
      tdn,
      direction: direction,
      times: tripStops.map((stop, i) => {
        return {
          name: stop,
          time: formatHHMM(times[i])
        }
      })
    }
  })

  let lines = []
  trips.forEach(trip => {
    lines.push({
      html: `<td>${trip.direction.toUpperCase()}</td><td>${trip.tdn}</td>`,
      class: 'tripHeader'
    })
    trip.times.forEach(stop => {
      lines.push({
        html: `<td>${stop.name}</td><td>${stop.time}</td>`,
        class: ''
      })
    })
  })

  let firstPageSize = 27
  let nextPageSizes = 44

  let page1 = lines.slice(0, firstPageSize)
  let remainingLines = lines.slice(firstPageSize)
  let pages = [page1]

  for (let i = 0; i < remainingLines.length; i+= nextPageSizes) {
    pages.push(remainingLines.slice(i, i + nextPageSizes))
  }

  res.render('metro', {
    circular: circularNumber,
    year: 20,
    lore,
    pages
  })
})

module.exports = router
