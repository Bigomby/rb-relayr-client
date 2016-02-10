'use strict';

var Q = require('q');
var winston = require('winston')
var Relayr = require('relayr')

var RelayrApiClientConfig = require('../config/relayrApiClient')

var logger = new(winston.Logger)({
  transports: [new(winston.transports.Console)({
    level: 'info',
    prettyPrint: true,
    colorize: true,
    label: 'api-client'
  })]
})

function RelayrApiClient() {
  this.token = RelayrApiClientConfig.token
  this.appId = RelayrApiClientConfig.appId

  this.relayr = new Relayr(this.appId)
}

RelayrApiClient.prototype.Connect = function (devId) {
  this.relayr.connect(this.token, devId)
}

RelayrApiClient.prototype.ConnectAll = function () {
  var this_ = this
  var deferred = Q.defer()

  this.relayr.user(this.token, function (err, user) {
    if (err) {
      logger.error(err)
      deferred.reject()
    } else {
      this_.relayr.devices(user.id, this_.token, function (err, devices) {

        for (var i = 0; i < devices.length; i++) {
          this_.relayr.connect(this_.token, devices[i].id)
          logger.debug('Connected to device: ' + devices[i].id)
        }

        logger.info('Connected to devices')
        deferred.resolve()
      })
    }
  })

  return deferred.promise
}

RelayrApiClient.prototype.AddProducer = function (producer) {
  this.relayr.on('data', function (topic, msg) {
    msg.topic = topic
    producer.produce(msg)
  })
}

module.exports = RelayrApiClient
