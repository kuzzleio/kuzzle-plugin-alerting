 Feature: Threshold Alarm

   Scenario: Add a new alarm rule (High Threshold)
    Given a 'customer-index':'alarms' index and collection
    And a 'customer-index':'temperature' collection
    And a 'customer-index':'triggeredAlarm' collection
    And an alarm named "high temp"
    And the following condition for this alarm:
      | type | threshold |
      | index | customer-index |
      | collection | temperature |
      | filter | {"range": { "data.temperature": { "gt": 42 } }} |
    And the following action for this alarm:
      | action | { "type": "api", "request": { "controller": "document", "action":"create", "index": "customer-index", "collection": "triggeredAlarm", "body" : {"triggeredValue": "{data.temperature}", "message": "Temp of device {device.id} is too high (currently at {data.temperature} {data.unit})"}}} |
    When I create this alarm
    And a document is created in 'customer-index':'temperature' with a body containing:
      |data|{"unit": "Celsius", "temperature" : 43}|
      |device|{"id": "sfa-A113"}|
    Then a document should be created in 'customer-index':'triggeredAlarm' with the following body '{"triggeredValue" : "43"}'

   Scenario: Add a new alarm rule (Low Threshold)
    Given a 'customer-index':'alarms' index and collection
    And a 'customer-index':'temperature' collection
    And a 'customer-index':'triggeredAlarm' collection
    And an alarm named "low temp"
    And the following condition for this alarm:
      | type | threshold |
      | index | customer-index |
      | collection | temperature |
      | filter | {"range": { "data.temperature": { "lt": -20 } }} |
    And the following action for this alarm:
      | action | { "type": "api", "request": { "controller": "document", "action":"create", "index": "customer-index", "collection": "triggeredAlarm", "body" : {"triggeredValue": "{data.temperature}", "message": "Temp of device {device.id} is too low (currently at {data.temperature} {data.unit})"}}} |
    When I create this alarm
    And a document is created in 'customer-index':'temperature' with a body containing:
      |data|{"unit": "Celsius", "temperature" : -30}|
      |device|{"id": "sfa-A113"}|
    Then a document should be created in 'customer-index':'triggeredAlarm' with the following body '{"triggeredValue" : "-30"}'

   Scenario: Remove an alarm rule
    Given a 'customer-index':'alarms' index and collection
    And a 'customer-index':'temperature' collection
    And a 'customer-index':'triggeredAlarm' collection
    And an alarm named "low temp"
    And the following condition for this alarm:
      | type | threshold |
      | index | customer-index |
      | collection | temperature |
      | filter | {"range": { "data.temperature": { "lt": -20 } }} |
    And the following action for this alarm:
      | action | { "type": "api", "request": { "controller": "document", "action":"create", "index": "customer-index", "collection": "triggeredAlarm", "body" : {"triggeredValue": "{data.temperature}", "message": "Temp of device {device.id} is too low (currently at {data.temperature} {data.unit})"}}} |
    And a certain number of documents in 'customer-index':'triggeredAlarm'
    When I create this alarm
    And I delete this alarm
    And a document is created in 'customer-index':'temperature' with a body containing:
      |data|{"unit": "Celsius", "temperature" : -30}|
      |device|{"id": "sfa-A113"}|
    Then It shouldn't increment the number of documents in 'customer-index':'triggeredAlarm'

  Scenario: Forgetting the actions in the alarm request
    Given a 'customer-index':'alarms' index and collection
    And a 'customer-index':'temperature' collection
    And a 'customer-index':'triggeredAlarm' collection
    And an alarm named "low temp"
    And the following condition for this alarm:
      | type | threshold |
      | index | customer-index |
      | collection | temperature |
      | filter | {"range": { "data.temperature": { "lt": -20 } }} |
    When I create this alarm
    Then I should get an Error with status 400

  Scenario: Forgetting the condition in the alarm request
    Given a 'customer-index':'alarms' index and collection
    And a 'customer-index':'temperature' collection
    And a 'customer-index':'triggeredAlarm' collection
    And an alarm named "low temp"
    And the following action for this alarm:
      | action | { "type": "api", "request": { "controller": "document", "action":"create", "index": "customer-index", "collection": "triggeredAlarm", "body" : {"triggeredValue": "{data.temperature}", "message": "Temp of device {device.id} is too low (currently at {data.temperature} {data.unit})"}}} |
    When I create this alarm
    Then I should get an Error with status 400

  Scenario: Forgetting the name in the alarm request
    Given a 'customer-index':'alarms' index and collection
    And a 'customer-index':'temperature' collection
    And a 'customer-index':'triggeredAlarm' collection
    And the following condition for this alarm:
      | type | threshold |
      | index | customer-index |
      | collection | temperature |
      | filter | {"range": { "data.temperature": { "lt": -20 } }} |
    And the following action for this alarm:
      | action | { "type": "api", "request": { "controller": "document", "action":"create", "index": "customer-index", "collection": "triggeredAlarm", "body" : {"triggeredValue": "{data.temperature}", "message": "Temp of device {device.id} is too low (currently at {data.temperature} {data.unit})"}}} |
    When I create this alarm
    Then I should get an Error with status 400