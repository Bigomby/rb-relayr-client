'use strict'

var kafka = require('kafka-node')
var winston = require('winston')
var _ = require('lodash')
var Q = require('q')

var config = require('../config/kafkaProducer')

var logger = new (winston.Logger)({
  transports: [new (winston.transports.Console)({
    level: 'info',
    colorize: true,
    prettyPrint: true,
    label: 'producer'
  })]
})

function KafkaProducer() {
  this.connectionString = config.connectionString
  this.clientId = config.clientId
  this.topic = config.topic
}

KafkaProducer.prototype.Init = function() {
  var deferred = Q.defer()

  this.client = new kafka.Client(
    this.connectionString,
    this.clientId
  )
  this.producer = new kafka.Producer(this.client)

  this.producer.on('ready', function() {
    deferred.resolve()
  })
  this.producer.on('error', function(err) {
    deferred.reject(err)
  })

  return deferred.promise
}

KafkaProducer.prototype.produce = function(msg) {
  var messages = []

  for (var i = 0; i < msg.readings.length; i++) {
    if (typeof msg.readings[i].value !== 'object') {
      var value = msg.readings[i].value

      if (msg.readings[i].monitor === 'humidity' && msg.readings[i].value > 100) {
        value = 100
      }
      var kafkaMessage = {
        'proxy_uuid': config.proxyUuid,
        'sensor_uuid': msg.deviceId,
        'timestamp': Math.floor(msg.received / 1000),
        'value': value.toString(),
        'monitor': msg.readings[i].meaning,
        'sensor_name': msg.deviceData.name
      }

      if (kafkaMessage.timestamp === null || isNaN(kafkaMessage.timestamp)) {
        kafkaMessage.timestamp = Math.floor(new Date() / 1000)
      }

      _.extend(kafkaMessage, config.enrichment)

      messages.push(JSON.stringify(kafkaMessage))
    }
  }

  this.producer.send([{
    topic: config.topic,
    messages: messages
  }], function() {
    logger.debug(messages)
  })
}

module.exports = KafkaProducer
