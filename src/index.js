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
producer.Init().then(
  function () {
    logger.info('Kafka producer ready')
    relayrApiClient.ConnectAll().then(function () {
      logger.info('Connected to all devices')
      relayrApiClient.AddProducer(producer)
    })
  },
  function (err) {
    logger.error(err)
  }
)
