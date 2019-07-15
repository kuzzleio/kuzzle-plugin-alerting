'use strict';

const
  { After, Before, BeforeAll } = require('cucumber'),
  { Kuzzle, WebSocket } = require('kuzzle-sdk');
  // testMappings = require('../fixtures/mappings'),
  // testFixtures = require('../fixtures/fixtures'),

BeforeAll(async function () {
});

Before(async function () {
  this.kuzzle = new Kuzzle(
    new WebSocket(this.host, { port: this.port })
  );

  await this.kuzzle.connect();

  await this.kuzzle.query({
    controller: 'admin',
    action: 'resetDatabase',
    refresh: 'wait_for'
  });
});

After(async function () {
  // Clean values stored by the scenario
  this.props = {};

  if (this.kuzzle && typeof this.kuzzle.disconnect === 'function') {
    this.kuzzle.disconnect();
  }
});
