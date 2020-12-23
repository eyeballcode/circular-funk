const express = require('express')
const router = new express.Router()
const moment = require('moment');

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

let lines = [
  'Alamein',
  'Belgrave',
  'Craigieburn',
  'Cranbourne',
  'Frankston',
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
  'N453',
  'N454',
  'N455',
  'N456',
  'N457',
  'N458',
  'N459',
  'N460',
  'N461',
  'N462',
  'N463',
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
  'N474',
  'N475'
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
  let futureDay = now.add(Math.random() * 10, 'days')

  loreText = loreText.replace(new RegExp(`#{future_day}`, 'g'), futureDay.format('dddd, MMMM Do YYYY'))
  title = title.replace(new RegExp(`#{future_day}`, 'g'), futureDay.format('dddd, MMMM Do YYYY'))

  return {
    ...lore,
    title,
    lore: loreText,
    consist
  }
}

let metroLores = [{
  title: 'IEV102 Overhead Inspection Run',
  lore: 'The Infrastructure Evaluation Vehicle (IEV 102) is a purpose built overhead inspection Vehicle. It is fitted with two pantographs and an observation platform. The vehicle is designed to allow monitoring of contact wire height and stagger and also inspect the overhead traction network at normal line speed to ensure safe and effective operation of the traction network.',
  consist: '#{diesel_loco_a}, IEV 102, #{diesel_loco_b} (push/pull)',
  nonRevenue: true
}, {
  title: '#{diesel_loco_a} "The #{line_a}sider" Heritage Run to #{line_a}',
  lore: 'V/Line Victoria will be operating a heritage train to #{line_a} on #{future_day} as part of it\'s celebrations of #{diesel_loco_a}\'s birthday. As part of the tour, #{diesel_loco_a} will visit various locations along the #{line_a} line. The train will also visit #{line_b} and #{line_c} as part of its tour. This heritage train will be filled with foamers and twelvies to raise revenue.',
  consist: '#{diesel_loco_a}, BTH162, BH149, BIH184, BH142, BIH182, BCH122',
  nonRevenue: true
}, {
  title: 'Introduction of HCMT to Revenue Services',
  lore: 'After months of extensive testing the Metro HCMT fleet has finally been approved for revenue service on the #{line_a} and #{line_b} lines. The HCMTs will be entering service on #{future_day}, running from #{line_a} to Flinders Street and return. The HCMT will run one (1) revenue trip before returning to the depot for a media briefing. Staff are to be stationed at the platform to clear out the train upon arrival.',
  consist: '#{hcmt_a}',
  nonRevenue: false
}]

router.get('/', (req, res) => {
  let circularNumber = Math.ceil(Math.random() * 9999)

  res.render('metro', {
    circular: circularNumber,
    year: 20,
    lore: fillOut(pickRandom(metroLores))
  })
})

module.exports = router
