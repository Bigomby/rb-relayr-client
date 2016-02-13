'use strict'

var winston = require('winston')

var KafkaProducer = require('./kafkaProducer')
var RelayrApiClient = require('./relayrApiClient')

var logger = new (winston.Logger)({
  transports: [new (winston.transports.Console)({
    level: 'info',
    colorize: true,
    label: 'index.js'
  })]
})

var relayrApiClient = new RelayrApiClient()
var producer

if (process.argv[2] === 'list') {
  relayrApiClient.ListDevices().then(function () {
    process.exit()
  })
} else if (!process.argv[2]) {
// Initialize the kafka producer
  logger.info('Connecting to all devices')
  producer = new KafkaProducer()
  producer.Init()
  // Connecto to all the devices
  .then(relayrApiClient.ConnectAll())
  // Use the kafka producer to send data gathered from devices
  .then(relayrApiClient.AddProducer(producer))
} else {
  logger.info('Connecting to ' + process.argv[2])
  producer = new KafkaProducer()
  producer.Init()
  // Connecto to all the devices
  .then(relayrApiClient.Connect(process.argv[2]))
  // Use the kafka producer to send data gathered from devices
  .then(relayrApiClient.AddProducer(producer))
}
