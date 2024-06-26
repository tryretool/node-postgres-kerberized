'use strict'
var helper = require('../test-helper')
var Client = require('../../lib/native')
var Query = Client.Query
const assert = require('assert')
const suite = new helper.Suite()

suite.test('many rows', function () {
  var client = new Client(helper.config)
  client.connect()
  var q = client.query(new Query('SELECT * FROM person'))
  var rows = []
  q.on('row', function (row) {
    rows.push(row)
  })
  assert.emits(q, 'end', function () {
    client.end()
    assert.lengthIs(rows, 26)
  })
})

suite.test('many queries', function () {
  var client = new Client(helper.config)
  client.connect()
  var count = 0
  var expected = 100
  for (var i = 0; i < expected; i++) {
    var q = client.query(new Query('SELECT * FROM person'))
    assert.emits(q, 'end', function () {
      count++
    })
  }
  assert.emits(client, 'drain', function () {
    client.end()
    assert.equal(count, expected)
  })
})

suite.test('many clients', function () {
  var clients = []
  for (var i = 0; i < 10; i++) {
    clients.push(new Client(helper.config))
  }
  clients.forEach(function (client) {
    client.connect()
    for (var i = 0; i < 20; i++) {
      client.query('SELECT * FROM person')
    }
    assert.emits(client, 'drain', function () {
      client.end()
    })
  })
})
