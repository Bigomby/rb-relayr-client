'use strict'

var fs = require('fs')
var Q = require('q')
var winston = require('winston')
var Relayr = require('relayr')

var RelayrApiClientConfig = require('../config/relayrApiClient')

var logger = new (winston.Logger)({
  transports: [new (winston.transports.Console)({
    level: 'info',
    prettyPrint: true,
    colorize: true,
    label: 'api-client'
  })]
})

function RelayrApiClient() {
  this.token = RelayrApiClientConfig.token
  this.appId = RelayrApiClientConfig.appId
  this.deviceDb = []

  this.relayr = new Relayr(this.appId)
}

RelayrApiClient.prototype.Connect = function(devId) {
  this.relayr.connect(this.token, devId)
}

RelayrApiClient.prototype.ConnectAll = function() {
  var this_ = this
  var deferred = Q.defer()

  this.relayr.user(this.token, function(err, user) {
    if (err) {
      logger.error(err)
      deferred.reject()
    } else {
      this_.relayr.devices(user.id, this_.token, function(err, devices) {
        if (err) {
          logger.error(err)
        } else {
          for (var i = 0; i < devices.length; i++) {
            this_.relayr.connect(this_.token, devices[i].id)
            this_.deviceDb.push(devices[i])
            logger.debug('Connected to device: ' + devices[i].id)
          }

          logger.info('Connected to devices')
        }
      })
    }
  })

  return deferred.promise
}

RelayrApiClient.prototype.AddProducer = function(producer) {
  var this_ = this

  this.relayr.on('data', function(topic, msg) {
    msg.topic = topic
    msg.deviceData = this_.GetDeviceData(msg.deviceId)
    logger.debug(msg)
    producer.produce(msg)
  })
}

RelayrApiClient.prototype.ListDevices = function() {
  var this_ = this
  var deferred = Q.defer()

  this.relayr.user(this.token, function(err, user) {
    if (err) {
      logger.error(err)
    } else {
      logger.info(user)
      this_.relayr.devices(user.id, this_.token, function(err, devices) {
        if (err) {
          logger.error(err)
        } else {
          fs.writeFile('devices.json', JSON.stringify(devices, null, 2), function() {
            deferred.resolve()
          })
        }
      })
    }
  })

  return deferred.promise
}

RelayrApiClient.prototype.GetDeviceData = function(id) {
  var device

  this.deviceDb.forEach(function(elt) {
    if (elt.id === id) {
      device = elt
      return
    }
  })

  return device
}

module.exports = RelayrApiClient
