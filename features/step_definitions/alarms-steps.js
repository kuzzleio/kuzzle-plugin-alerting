const { Given, When, Then } = require('cucumber'),
  should = require('should'),
  helpers = require('./steps-helpers');

Given('an alarm named {string}', async function (name) {
  this.props.alarm.name = name;
});

Given('the following condition for this alarm:', async function (table) {
  const condition = helpers._parseTable(table.rowsHash());
  this.props.alarm.condition = condition;
});

Given('the following action for this alarm:', async function (table) {
  if (!this.props.alarm.actions) {
    this.props.alarm.actions = [];
  }
  const action = helpers._parseTable(table.rowsHash()).action;
  this.props.alarm.actions.push(action);
});

When('I create this alarm', async function () {
  try {
    const res = await this.kuzzle.document.create(this.props.index, this.props.collection, this.props.alarm, undefined, { refresh: 'wait_for' });
    this.props.alarmId = res._id;
  } catch (e) {
    this.error = e;
  }
});

When('I delete this alarm', async function () {
  await this.kuzzle.document.delete(this.props.index, 'alarms', this.props.alarmId);
});

When(/I check for idle alarms( with refresh option)?/, async function (refresh) {
  const body = refresh ? { 'refresh': 'wait_for' } : {};
  const query = {
    'controller': 'alerting/alarm',
    'action': 'checkIdle',
    'body': body
  };
  this.props.numberTriggeredAlarm = (await this.kuzzle.query(query)).result;
});

Then('the number of triggered alarms should be {int}', async function (numberTriggeredAlarm) {
  should(this.props.numberTriggeredAlarm).be.eql(numberTriggeredAlarm);
});
