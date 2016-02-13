// var sinon = require('sinon')
// var mockery = require('mockery')
// var should = require('chai').should()
// var EventEmitter = require('events').EventEmitter;
// var util = require('util')
//
// describe('Kafka producer', function () {
//   var kafkaStub = {}
//   var RbKafkaProducer
//
//   before(function () {
//     mockery.enable({
//       warnOnReplace: false,
//       warnOnUnregistered: false,
//       useCleanCache: true
//     });
// 
//     kafkaStub.Client = sinon.spy()
//     kafkaStub.Producer = function () {
//       var this_ = this
//       this_.send = sinon.spy()
//       process.nextTick(function () {
//         this_.emit('ready')
//       })
//     }
//     util.inherits(kafkaStub.Producer, EventEmitter);
//
//     mockery.registerMock('kafka-node', kafkaStub)
//     KafkaProducer = require('./kafkaProducer')
//   });
//
//   after(function () {
//     mockery.disable()
//   });
//
//   it('sends a message to kafka', function (done) {
//     var producer = new KafkaProducer()
//     producer.Init().then(function () {
//       producer.produce({
//         message: 'Hello World'
//       })
//
//       producer.producer.send.calledWith({
//         message: 'Hello World'
//       }).should.be.equal(true)
//       done()
//     }).catch(function (e) {
//       done(e);
//     })
//   })
// })
