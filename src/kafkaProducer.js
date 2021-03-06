'use strict'

var kafka = require('kafka-node')
var winston = require('winston')
var _ = require('lodash')
var Q = require('q')

var config = require('../config/kafkaProducer')

var logger = new(winston.Logger)({
  transports: [new(winston.transports.Console)({
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

KafkaProducer.prototype.Init = function () {
  var deferred = Q.defer()

  this.client = new kafka.Client(
    this.connectionString,
    this.clientId
  )
  this.producer = new kafka.Producer(this.client)

  this.producer.on('ready', function () {
    deferred.resolve()
  })
  this.producer.on('error', function (err) {
    deferred.reject(err)
  })

  return deferred.promise
}

KafkaProducer.prototype.produce = function (msg) {
  var kafkaPayloads = []

  for (var i = 0; i < msg.readings.length; i++) {
    if (typeof msg.readings[i].value !== 'object') {

      var kafkaMessage = {
        "proxy_uuid": config.proxyUuid,
        "sensor_uuid": msg.deviceId,
        "timestamp": Math.floor(msg.readings[i].recorded / 1000),
        "value": msg.readings[i].value.toString(),
        "monitor": msg.readings[i].meaning
      }

      _.extend(kafkaMessage, config.enrichment)

      kafkaPayloads.push({
        topic: config.topic,
        messages: JSON.stringify(kafkaMessage)
      })
    }
  }

  this.producer.send(kafkaPayloads, function () {
    logger.debug(kafkaPayloads)
  })
}

module.exports = KafkaProducer
