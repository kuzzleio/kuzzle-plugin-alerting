// See https://docs.kuzzle.io/api/1/controller-admin/load-mappings/

// Alarm mapping
module.exports = {
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
        'type': 'percolator'
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
};
