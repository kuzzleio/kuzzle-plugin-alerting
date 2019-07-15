const
  should = require('should'),
  {
    Given,
    When,
    Then
  } = require('cucumber');

Given('An existing {string}:{string} index and collection', async function (index, collection) {
  if (!await this.kuzzle.index.exists(index)) {
    throw new Error(`Index ${index} does not exist`);
  }

  if (!await this.kuzzle.collection.exists(index, collection)) {
    throw new Error(`Collection ${index}:${collection} does not exist`);
  }

  this.props.index = index;
  this.props.collection = collection;
});

Given('A {string}:{string} index and collection', async function (index, collection) {
  await this.kuzzle.index.create(index);
  await this.kuzzle.collection.create(index, collection);

  this.props.index = index;
  this.props.collection = collection;
});

Given('A {string}:{string} collection', async function (index, collection) {
  await this.kuzzle.collection.create(index, collection);
});

Given('an alarm named {string} with the following condition:', async function (name, table) {
  const condition = table.rowsHash();
  condition.filter = JSON.parse(condition.filter);
  this.props.alarm = {
    name: name,
    condition: condition
  };
});

Given('this alarm with the following action:', async function (table) {
  if (!this.props.alarm.actions) {
    this.props.alarm.actions = [];
  }
  const action = JSON.parse(table.rowsHash().action);
  this.props.alarm.actions.push(action);

  await this.kuzzle.document.create(this.props.index, this.props.collection, this.props.alarm, null, { refresh: 'wait_for' });
});

When('A document is created in {string}:{string} with a body containing:', async function (index, collection, table) {
  const data = _parseTable(table.rowsHash());
  await this.kuzzle.document.create(index, collection, data);
});

/**
 * We check that the document has been created and that it contains the specified body
 *
 * We wait max 4000ms before throwing an error cause the timeout limit is fixed at 5000ms by Cucumber.
 * After that, the test will automatically fail.
 */
Then('A document should be created in {string}:{string} with the following body {string}', async function (index, collection, body) {
  let receivedNotif;
  body = JSON.parse(body);

  await this.kuzzle.realtime.subscribe(index, collection, {}, notif => { receivedNotif = notif; });
  for (let i = 40; i > 0 & !receivedNotif; i--) {
    await _sleep(100);
  }

  if (!receivedNotif) {
    throw new Error('The document has not been created');
  } else {
    should(receivedNotif.result._source).have.properties(body);
  }
});

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Improves rowsHash function by considering nested JSON
 * @param table result of rowsHash() function
 */
function _parseTable(table) {
  for (const key of Object.getOwnPropertyNames(table)) {
    table[key] = JSON.parse(table[key]);
  }
  return table;
}

