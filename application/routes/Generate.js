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

let aLocos = [
  'A60',
  'A62',
  'A66',
  'A70',
  'A78',
]

let bLocos = [
  'B61',
  'B63',
  'B64',
  'B65',
  'B72',
  'B74',
  'B75',
  'B76',
  'B80',
]

let nLocos = [
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

let pLocos = [
  'P11',
  'P12',
  'P13',
  'P14',
  'P15',
  'P16',
  'P17',
  'P18',
  'P19',
  'P20',
  'P21',
  'P22',
  'P23'
]

let tLocos = [
  'T333',
  'T334',
  'T341',
  'T342',
  'T345',
  'T356',
  'T357',
  'T363',
  'T364',
  'T369',
  'T371',
  'T373',
  'T376',
  'T377',
  'T378',
  'T379',
  'T381',
  'T382',
  'T383',
  'T385',
  'T386',
  'T387',
  'T388',
  'T390',
  'T392',
  'T395',
  'T399',
  'T402',
  'T404',
  'T408',
  'T409',
  'T411',
]

let dieselLocomotives = [
  ...aLocos,
  ...bLocos,
  ...nLocos,
  ...pLocos,
  ...tLocos
]

let heritageOperators = [
  'SRHC',
  '707 Operations',
  'Steamrail Victoria',
  'DERMPAV'
]

let freightOperators = [
  'Southern Shorthaul Railroad',
  'QUBE Logistics',
  'SCT Logistics',
  'Pacific National'
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
  let heritageOperatorsAvailable = shuffle(heritageOperators).slice(0, 26)
  let freightOperatorsAvailable = shuffle(freightOperators).slice(0, 26)

  let aLocosAvailable = shuffle(aLocos).slice(0, 26)
  let bLocosAvailable = shuffle(bLocos).slice(0, 26)
  let nLocosAvailable = shuffle(nLocos).slice(0, 26)
  let pLocosAvailable = shuffle(pLocos).slice(0, 26)
  let tLocosAvailable = shuffle(tLocos).slice(0, 26)

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

  for (let n = 0; n < heritageOperatorsAvailable.length; n++) {
    let regex = new RegExp(`#{heritage_${String.fromCharCode(97 + n)}}`, 'g')
    loreText = loreText.replace(regex, heritageOperatorsAvailable[n])
    title = title.replace(regex, heritageOperatorsAvailable[n])
    consist = consist.replace(regex, heritageOperatorsAvailable[n])
  }

  for (let n = 0; n < freightOperatorsAvailable.length; n++) {
    let regex = new RegExp(`#{freight_${String.fromCharCode(97 + n)}}`, 'g')
    loreText = loreText.replace(regex, freightOperatorsAvailable[n])
    title = title.replace(regex, freightOperatorsAvailable[n])
    consist = consist.replace(regex, freightOperatorsAvailable[n])
  }

  for (let n = 0; n < aLocosAvailable.length; n++) {
    let regex = new RegExp(`#{a_loco_${String.fromCharCode(97 + n)}}`, 'g')
    loreText = loreText.replace(regex, aLocosAvailable[n])
    title = title.replace(regex, aLocosAvailable[n])
    consist = consist.replace(regex, aLocosAvailable[n])
  }

  for (let n = 0; n < bLocosAvailable.length; n++) {
    let regex = new RegExp(`#{b_loco_${String.fromCharCode(97 + n)}}`, 'g')
    loreText = loreText.replace(regex, bLocosAvailable[n])
    title = title.replace(regex, bLocosAvailable[n])
    consist = consist.replace(regex, bLocosAvailable[n])
  }

  for (let n = 0; n < nLocosAvailable.length; n++) {
    let regex = new RegExp(`#{n_loco_${String.fromCharCode(97 + n)}}`, 'g')
    loreText = loreText.replace(regex, nLocosAvailable[n])
    title = title.replace(regex, nLocosAvailable[n])
    consist = consist.replace(regex, nLocosAvailable[n])
  }

  for (let n = 0; n < pLocosAvailable.length; n++) {
    let regex = new RegExp(`#{p_loco_${String.fromCharCode(97 + n)}}`, 'g')
    loreText = loreText.replace(regex, pLocosAvailable[n])
    title = title.replace(regex, pLocosAvailable[n])
    consist = consist.replace(regex, pLocosAvailable[n])
  }

  for (let n = 0; n < tLocosAvailable.length; n++) {
    let regex = new RegExp(`#{t_loco_${String.fromCharCode(97 + n)}}`, 'g')
    loreText = loreText.replace(regex, tLocosAvailable[n])
    title = title.replace(regex, tLocosAvailable[n])
    consist = consist.replace(regex, tLocosAvailable[n])
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
    lines: linesAvailable,
    date: futureDay
  }
}

let metroLores = [{
  title: 'IEV102 Overhead Inspection Run',
  lore: 'The Infrastructure Evaluation Vehicle (IEV 102) is a purpose built overhead inspection Vehicle. It is fitted with two pantographs and an observation platform. The vehicle is designed to allow monitoring of contact wire height and stagger and also inspect the overhead traction network at normal line speed to ensure safe and effective operation of the traction network.',
  consist: '#{diesel_loco_a}, IEV 102, #{diesel_loco_b} (push/pull)',
  nonRevenue: true,
  times: ['a.down', 'a.up'],
  tdnRange: 7000,
  stableAt: 'South Dynon'
}, {
  title: '#{diesel_loco_a} "The #{line_a}sider" Heritage Run to #{line_a}',
  lore: 'V/Line Victoria will be operating a heritage train to #{line_a} on #{future_day} as part of it\'s celebrations of #{diesel_loco_a}\'s birthday. As part of the tour, #{diesel_loco_a} will visit various locations along the #{line_a} line. The train will also visit #{line_b} and #{line_c} as part of its tour. This heritage train will be filled with foamers and twelvies to raise revenue.',
  consist: '#{diesel_loco_a}, #{diesel_loco_b}, #{diesel_loco_c}, BTH162, BH149, BIH184, BH142, BIH182, BCH122',
  nonRevenue: true,
  times: ['a.down', 'a.up', 'b.down', 'b.up', 'c.down', 'c.up'],
  tdnRange: 8000,
  stableAt: 'Newport'
}, {
  title: 'Introduction of HCMT to Revenue Services',
  lore: 'After months of extensive testing the Metro HCMT fleet has finally been approved for revenue service on the #{line_a} and #{line_b} lines. The HCMTs will be entering service on #{future_day}, running from #{line_a} to Flinders Street and return. The HCMT will run one (1) revenue trip before returning to the depot for a media briefing. Staff are to be stationed at the platform to clear out the train upon arrival.',
  consist: '#{hcmt_a}',
  nonRevenue: false,
  times: ['a.up', 'a.down', 'a.up', 'a.down'],
  tdnRange: 7000,
  stableAt: null
}, {
  title: 'Retirement run of Comeng Train to #{line_a}, #{line_b}, #{line_c} and #{line_d}.',
  lore: 'As the Comeng fleet approaches 40 years old the Fleet department has started to retire the oldest units. To commemorate the many years of service these trains have run, Metro has organised a tour run throughout the suburban network. The tour will visit #{line_a}, #{line_b}, #{line_c} and #{line_d}.',
  consist: 'Any available Comeng train',
  nonRevenue: true,
  times: ['a.down', 'a.up', 'b.down', 'b.up', 'c.down', 'c.up', 'd.down', 'd.up'],
  tdnRange: 7000,
  stableAt: 'Melbourne Yard'
}, {
  title: 'Light Loco Transfer to SRHC',
  lore: 'To support the retirement of locomotives from Freight Operator #{freight_a} and #{freight_b} a number of locomotives will be transferred light loco to the SRHC depot. These locos will then be transferred to SRHC control. WTT Approved Rollingstock will be updated in a separate SW circular yet to be issued. The transfer consist is to be hauled by two (2) N class locos leased from V/Line',
  consist: '#{n_loco_a}, #{n_loco_b}, #{a_loco_a}, #{a_loco_b}, #{a_loco_c}, #{a_loco_d}, #{b_loco_a}, #{b_loco_b}, #{b_loco_c}, #{t_loco_a}',
  nonRevenue: true,
  times: ['Seymour.down'],
  tdnRange: 7000,
  stableStart: 'South Dynon',
  stableTo: 'Southern Cross'
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

  let linesVisited = []

  if (lore.stableAt) {
    lore.stableStart = lore.stableAt
    lore.stableEnd = lore.stableEnd
  }

  if (lore.stableStart) lore.times = [lore.stableStart + '.up', ...lore.times]
  if (lore.stableEnd) lore.times = [...lore.times, lore.stableEnd + '.down']

  let trips = lore.times.map(trip => {
    let [lineCode, direction] = trip.split('.')
    let lineName = lore.lines[lineCode.charCodeAt(0) - 97]

    let baseTDN = lore.tdnRange

    if (lineCode.length > 1) lineName = lineCode

    if (lineCode === 'Newport') baseTDN = 8000
    if (lineCode === 'Melbourne Yard') baseTDN = 5000
    if (lineCode === 'South Dynon') baseTDN = 7000

    let lineStops = allLines[lineName].slice(0)

    if (!linesVisited.includes(lineName)) linesVisited.push(lineName)

    let tripStops = lineStops
    if (direction === 'up') tripStops.reverse()

    if (lore.stableStart === lineCode && lore.stableTo && direction === 'up') {
      tripStops = tripStops.slice(0, tripStops.indexOf(lore.stableTo) + 1)
    }

    if (lore.stableEnd === lineCode && lore.stableTo && direction === 'down') {
      tripStops = tripStops.slice(tripStops.indexOf(lore.stableTo))
    }

    let times = generateTimes(tripStops.length, currentStart)

    let endTime = times[times.length - 1]
    let newStart = endTime + 3 + Math.random() * 5

    currentStart = newStart

    let tdn = baseTDN + Math.round(Math.random() * 998)
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

  if (lore.stableAt) linesVisited.push(linesVisited[0])

  let lines = []
  trips.forEach(trip => {
    lines.push({
      html: `<td>${trip.direction.toUpperCase()}</td><td>${trip.tdn}</td>`,
      class: 'tripHeader',
      table: true
    })

    trip.times.forEach(stop => {
      lines.push({
        html: `<td>${stop.name}</td><td>${stop.time}</td>`,
        class: '',
        table: true
      })
    })
  })

  let firstPageSize = 23
  let nextPageSize = 44

  let title = linesVisited.join(' - ').toUpperCase().replace('RACECOURSE', 'RACES')
  if (title.length > 44) firstPageSize = 22

  let page1 = lines.slice(0, firstPageSize)
  let remainingLines = lines.slice(firstPageSize)
  let pages = [page1]

  for (let i = 0; i < remainingLines.length; i+= nextPageSize) {
    pages.push(remainingLines.slice(i, i + nextPageSize))
  }

  res.render('metro', {
    circular: circularNumber,
    year: 20,
    lore,
    pages,
    firstPageSize,
    nextPageSize,
    title
  })
})

module.exports = router
