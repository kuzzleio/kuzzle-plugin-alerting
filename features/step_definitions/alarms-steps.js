const {
  Given,
  When
} = require('cucumber');

Given('an alarm named {string}', async function (name) {
  this.props.alarm.name = name;
});

Given('the following condition for this alarm:', async function (table) {
  const condition = table.rowsHash();
  condition.filter = JSON.parse(condition.filter);
  this.props.alarm.condition = condition;
});

Given('the following action for this alarm:', async function (table) {
  if (!this.props.alarm.actions) {
    this.props.alarm.actions = [];
  }
  const action = JSON.parse(table.rowsHash().action);
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
