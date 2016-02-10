'use strict';

var winston = require('winston')

var KafkaProducer = require('./kafkaProducer')
var RelayrApiClient = require('./relayrApiClient')

var logger = new(winston.Logger)({
  transports: [new(winston.transports.Console)({
    level: 'info',
    colorize: true,
    label: 'index.js'
  })]
})

var producer = new KafkaProducer()
var relayrApiClient = new RelayrApiClient()

logger.info('Initializing kafka producer')

// Initialize the kafka producer
producer.Init()
  // Connecto to all the devices
  .then(relayrApiClient.ConnectAll())
  // Use the kafka producer to send data gathered from devices
  .then(relayrApiClient.AddProducer(producer))
