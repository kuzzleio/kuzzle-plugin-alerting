// See https://docs.kuzzle.io/api/1/controller-admin/load-mappings/

// Alarm mapping
module.exports = {
  'customer-index': {
    'alarms': {
      'properties': {
        'name': {
          'type': 'text',
        },
        'filterId': {
          'type': 'text',
          'fields': {
            'keyword': {
              'type': 'keyword',
              'ignore_above': 256
            }
          }
        },
        'condition': {
          'properties': {
            'type': {
              'type': 'text',
              'fields': {
                'keyword': {
                  'type': 'keyword',
                  'ignore_above': 256
                }
              }
            },
            'index': {
              'type': 'text'
            },
            'collection': {
              'type': 'text'
            },
            'filter': {
              'type': 'object'
            },
            'scope': {
              'type': 'text'
            },
            'duration': {
              'type': 'text'
            }
          }
        },
        'actions': {
          'properties': {
            'request': {
              'properties': {
                'controller': {
                  'type': 'text'
                },
                'action': {
                  'type': 'text'
                },
                'index': {
                  'type': 'text'
                },
                'collection': {
                  'type': 'text'
                }
              }
            }
          }
        }
      }
    },
    'devices': {
      'properties': {
        'device': {
          'properties': {
            'id': {
              'type': 'text',
              'fields': {
                'keyword': {
                  'type': 'keyword',
                  'ignore_above': 256
                }
              }
            }
          }
        },
        'message': {
          'type': 'text',
          'fields': {
            'keyword': {
              'type': 'keyword',
              'ignore_above': 256
            }
          }
        },
        'timestamp': {
          'type': 'date'
        }
      }
    }
  }
};
