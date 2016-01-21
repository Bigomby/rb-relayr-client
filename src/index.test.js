var expect = require('chai').expect
var rbRelayrClient = require('./index')

describe('check testing', function () {
  it('should work', function () {
    expect(true).to.be.true
  })
})

describe('testing tests', function () {
  it('should salute', function () {
    expect(rbRelayrClient.helloWorld).to.equal('Hello World')
  })
})
