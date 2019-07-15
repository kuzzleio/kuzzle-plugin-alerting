 Feature: Alarm trigerring

   Scenario: Add a new alarm rule (High Threshold)
    Given A 'customer-index':'alarms' index and collection
    And A 'customer-index':'temperature' collection
    And A 'customer-index':'triggeredAlarm' collection
    And an alarm named "high temp" with the following condition:
      | type | threshold |
      | index | customer-index |
      | collection | temperature |
      | filter | {"range": { "data.temperature": { "gt": 42 } }} |
    And this alarm with the following action:
      | action | { "type": "api", "request": { "controller": "document", "action":"create", "index": "customer-index", "collection": "triggeredAlarm", "body" : {"triggeredValue": "{data.temperature}", "message": "Temp of device {device.id} is too high (currently at {data.temperature} {data.unit})"}}} |
    When A document is created in 'customer-index':'temperature' with a body containing:
      |data|{"unit": "Celsius", "temperature" : 43}|
      |device|{"id": "sfa-A113"}|
    Then A document should be created in 'customer-index':'triggeredAlarm' with the following body '{"triggeredValue" : "43"}'

   Scenario: Add a new alarm rule (Low Threshold)
    Given A 'customer-index':'alarms' index and collection
    And A 'customer-index':'temperature' collection
    And A 'customer-index':'triggeredAlarm' collection
    And an alarm named "low temp" with the following condition:
      | type | threshold |
      | index | customer-index |
      | collection | temperature |
      | filter | {"range": { "data.temperature": { "lt": -20 } }} |
    And this alarm with the following action:
      | action | { "type": "api", "request": { "controller": "document", "action":"create", "index": "customer-index", "collection": "triggeredAlarm", "body" : {"triggeredValue": "{data.temperature}", "message": "Temp of device {device.id} is too low (currently at {data.temperature} {data.unit})"}}} |
    When A document is created in 'customer-index':'temperature' with a body containing:
      |data|{"unit": "Celsius", "temperature" : -30}|
      |device|{"id": "sfa-A113"}|
    Then A document should be created in 'customer-index':'triggeredAlarm' with the following body '{"triggeredValue" : "-30"}'
