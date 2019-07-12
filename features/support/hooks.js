'use strict';

const
  { After, Before, BeforeAll } = require('cucumber'),
  { Kuzzle, WebSocket } = require('kuzzle-sdk'),
  // testMappings = require('../fixtures/mappings'),
  // testFixtures = require('../fixtures/fixtures'),
  World = require('./world');

BeforeAll(async function () {
  const
    world = new World({ });

  world.kuzzle = new Kuzzle(
    new WebSocket(world.host, { port: world.port })
  );
});

Before(async function () {
  // const
  //   fixtures = Object.assign({}, testFixtures),
  //   mappings = Object.assign({}, testMappings);

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
