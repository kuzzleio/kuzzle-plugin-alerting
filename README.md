# kuzzle-plugin-alerting

## Configuration

If you want to change the name of the alarm collection you should use the `.kuzzlerc` file.
**Default value is `alarms`**

```
{
  "plugins": {
    "alerting": {
      "alarmCollection" : "deviceAlarms"
    }
  }
}
```