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

Given('a {string}:{string} index and collection', async function (index, collection) {
  await this.kuzzle.index.create(index);
  await this.kuzzle.collection.create(index, collection);

  this.props.index = index;
  this.props.collection = collection;
});

Given('a {string}:{string} collection', async function (index, collection) {
  await this.kuzzle.collection.create(index, collection);
});

Given('a certain number of documents in {string}:{string}', async function (index, collection) {
  this.props[`${index}:${collection}`] = await this.kuzzle.document.count(index, collection);
});

When('a document is created in {string}:{string} with a body containing:', async function (index, collection, table) {
  const data = _parseTable(table.rowsHash());
  await this.kuzzle.document.create(index, collection, data);
});

/**
 * We check that the document has been created and that it contains the specified body
 *
 * We wait max 4000ms before throwing an error cause the timeout limit is fixed at 5000ms by Cucumber.
 * After that, the test will automatically fail.
 */
Then('a document should be created in {string}:{string} with the following body {string}', async function (index, collection, body) {
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

Then(/I should get an Error (?:with status (.*))?/, async function (status) {
  should(this.error).not.be.null;
  if (this.error && status) {
    should(this.error.status).be.eql(parseInt(status));
  }
});

Then(/It should(n't)? increment the number of documents in '(.*)':'(.*)'/, async function (negation, index, collection) {
  const res = await this.kuzzle.document.count(index, collection),
    expected = negation ? this.props[`${index}:${collection}`] : this.props[`${index}:${collection}`] + 1;
  should(res).be.eql(expected);
});


// === Utils ===

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

