
const { setWorldConstructor } = require('cucumber');

function KuzzleWorld({ attach, parameters }) {
  this.attach = attach.attach;
  this.parameters = parameters;

  this.host = process.env.KUZZLE_HOST || 'localhost';
  this.port = process.env.KUZZLE_PORT || '7512';
  this.pluginName = require('../../manifest').name;

  this.props = { alarm: {}};
  this.error = null;
}

setWorldConstructor(KuzzleWorld);