 Feature: Idle Alarm

   Scenario: Add new alarm rule + Triggered (triggered w/ refresh)
    Given a 'customer-index':'alarms' index and collection
    And a 'customer-index':'devices' collection
    And a 'customer-index':'triggeredAlarm' collection
    And an alarm named "no logout for too long"
    And the following condition for this alarm:
      | type | idle |
      | index | customer-index |
      | collection | devices |
      | query | { "bool": { "should": [ { "bool": { "must": [ { "match_phrase_prefix": { "device.id": "sfa-A113" } } ], "must_not": [] } } ] } }|
      | time | { "duration": 1000, "field": "timestamp"} |
    And the following action for this alarm:
      | action | { "type": "api", "request": { "controller": "document", "action":"create", "index": "customer-index", "collection": "triggeredAlarm", "body" : {"device_id": "{device.id}", "message": "Device {device.id} is dead"}}} |
    When I create this alarm
    And a timestamped document is created in 'customer-index':'devices' with a body containing:
      | device | {"id": "sfa-A113"} |
      | message | heartbeat |
    And I wait for 2 seconds
    And I check for idle alarms with refresh option
    Then the number of triggered alarms should be 1
    And a document should be created in 'customer-index':'triggeredAlarm' with the following body '{"device_id" : "sfa-A113", "message": "Device sfa-A113 is dead"}'

   Scenario: Add new alarm rule + Triggered (triggered w/o refresh)
    Given a 'customer-index':'alarms' index and collection
    And a 'customer-index':'devices' collection
    And a 'customer-index':'triggeredAlarm' collection
    And an alarm named "no logout for too long"
    And the following condition for this alarm:
      | type | idle |
      | index | customer-index |
      | collection | devices |
      | query | { "bool": { "should": [ { "bool": { "must": [ { "match_phrase_prefix": { "device.id": "sfa-A113" } } ], "must_not": [] } } ] } }|
      | time | { "duration": 1000, "field": "timestamp"} |
    And the following action for this alarm:
      | action | { "type": "api", "request": { "controller": "document", "action":"create", "index": "customer-index", "collection": "triggeredAlarm", "body" : {"device_id": "{device.id}", "message": "Device {device.id} is dead"}}} |
    When I create this alarm
    And a timestamped document is created in 'customer-index':'devices' with a body containing:
      | device | {"id": "sfa-A113"} |
      | message | heartbeat |
    And I wait for 2 seconds
    And I check for idle alarms
    And a document should be created in 'customer-index':'triggeredAlarm' with the following body '{"device_id" : "sfa-A113", "message": "Device sfa-A113 is dead"}'

   Scenario: Remove an alarm
    Given a 'customer-index':'alarms' index and collection
    And a 'customer-index':'devices' collection
    And a 'customer-index':'triggeredAlarm' collection
    And an alarm named "no logout for too long"
    And the following condition for this alarm:
      | type | idle |
      | index | customer-index |
      | collection | devices |
      | query | { "bool": { "should": [ { "bool": { "must": [ { "match_phrase_prefix": { "device.id": "sfa-A113" } } ], "must_not": [] } } ] } }|
      | time | { "duration": 1000, "field": "timestamp"} |
    And the following action for this alarm:
      | action | { "type": "api", "request": { "controller": "document", "action":"create", "index": "customer-index", "collection": "triggeredAlarm", "body" : {"device_id": "{device.id}", "message": "Device {device.id} is dead"}}} |
    And a certain number of documents in 'customer-index':'triggeredAlarm'
    When I create this alarm
    And I delete this alarm
    And a timestamped document is created in 'customer-index':'devices' with a body containing:
      | device | {"id": "sfa-A113"} |
      | message | heartbeat |
    And I wait for 2 seconds
    And I check for idle alarms
    Then It shouldn't increment the number of documents in 'customer-index':'triggeredAlarm'

  ### Bad request tests ###

  Scenario: Forgetting the actions in the alarm request
    Given a 'customer-index':'alarms' index and collection
    And a 'customer-index':'devices' collection
    And a 'customer-index':'triggeredAlarm' collection
    And an alarm named "no logout for too long"
    And the following condition for this alarm:
      | type | idle |
      | index | customer-index |
      | collection | devices |
      | query | { "bool": { "should": [ { "bool": { "must": [ { "match_phrase_prefix": { "device.id": "sfa-A113" } } ], "must_not": [] } } ] } }|
      | time | { "duration": 1000, "field": "timestamp"} |
    When I create this alarm
    Then I should get an Error with status 400

  Scenario: Forgetting the condition in the alarm request
    Given a 'customer-index':'alarms' index and collection
    And a 'customer-index':'temperature' collection
    And a 'customer-index':'triggeredAlarm' collection
    And an alarm named "no logout for too long"
    And the following action for this alarm:
      | action | { "type": "api", "request": { "controller": "document", "action":"create", "index": "customer-index", "collection": "triggeredAlarm", "body" : {"device_id": "{device.id}", "message": "Device {device.id} is dead"}}} |
    When I create this alarm
    Then I should get an Error with status 400

  Scenario: Forgetting the name in the alarm request
    Given a 'customer-index':'alarms' index and collection
    And a 'customer-index':'temperature' collection
    And a 'customer-index':'triggeredAlarm' collection
    And the following condition for this alarm:
      | type | idle |
      | index | customer-index |
      | collection | devices |
      | query | { "bool": { "should": [ { "bool": { "must": [ { "match_phrase_prefix": { "device.id": "sfa-A113" } } ], "must_not": [] } } ] } }|
      | time | { "duration": 1000, "field": "timestamp"} |
    And the following action for this alarm:
      | action | { "type": "api", "request": { "controller": "document", "action":"create", "index": "customer-index", "collection": "triggeredAlarm", "body" : {"device_id": "{device.id}", "message": "Device {device.id} is dead"}}} |
    When I create this alarm
    Then I should get an Error with status 400