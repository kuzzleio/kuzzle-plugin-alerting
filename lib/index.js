const _ = require('lodash'),
  pluginName = require('../manifest.json').name;

class CorePlugin {
  constructor() {
    /**
     * @type {PluginContext}
     */
    this.context = null;

    this.config = {
      alarmCollection: 'alarms'
    };

    this.hooks = {
      'generic:document:afterWrite': 'checkAlarm',
      'generic:document:afterUpdate': 'checkAlarm'
      // update on config file?
    };

    this.pipes = {
      'generic:document:beforeWrite': 'registerAlarm',
      'generic:document:beforeDelete': 'unregisterAlarm'
    };

    this.controllers = {
    };

    /**
     * @type {Array}
     */
    this.routes = [
    ];

  }

  /**
   * Initializes the plugin with configuration and context.
   *
   * @param {Object} customConfig - This plugin custom configuration
   * @param {Object} context      - A restricted gateway to the Kuzzle API
   */
  init(customConfig, context) {
    this.config = Object.assign(this.config, customConfig);
    this.context = context;
    this.koncorde = new this.context.constructors.Koncorde();
  }

  /**
   * If a document is going to be created in an "alarms" collection (in any index) then we register
   * the alarm and fill the doc with the filter id
   */
  async registerAlarm(documents, request) {
    const { collection } = request.input.resource;
    if (collection === this.config.alarmCollection) {
      this._log('info', 'Registering new alarm(s)');
      for (const doc of documents) {
        const data = this._checkAlarmPayload(doc._source),
          koncordeRes = await this.koncorde.register(data.condition.index, data.condition.collection, data.condition.filter);

        data.filterId = koncordeRes.id;
      }
    }
    return documents;
  }

  /**
   * If a document is going to be deleted in an "alarms" collection (in any index) then we remove
   * the filter from koncorde engine
   */
  async unregisterAlarm(documents, request) {
    const sdk = this.context.accessors.sdk,
      { index, collection } = request.input.resource;
    for (const doc of documents) {
      const res = await sdk.document.get(index, collection, doc._id);
      await this.koncorde.remove(res._source.filterId);
    }
    return documents;
  }

  /**
   * This will be called on each creation or replacement or update of a document
   */
  async checkAlarm(documents) {
    for (const doc of documents) {
      const index = doc._index,
        collection = doc._type,
        data = doc._source,
        sdk = this.context.accessors.sdk;

      // Search for alarm triggered by the data
      const ids = this.koncorde.test(index, collection, data);

      if (ids.length === 0) {
        return;
      }

      const shouldCond = ids.map(id => ({
        bool: {
          must: [
            { term: { filterId: id } }
          ]
        }
      }));

      let res = await sdk.document.search(
        index,
        this.config.alarmCollection,
        {
          query: {
            bool: {
              should: shouldCond,
              minimum_should_match: 1
            }
          }
        },
        { scroll: '1m', size: 500 }
      );

      while (res) {
        for (const hit of res.hits) {
          const actions = hit._source.actions;
          for (const action of actions) {
            switch (action.type) {
              case 'api':
                this._formatRequest(action.request, data);
                sdk.query(action.request)
                  .catch(err => {
                    this._log('error', `One action couldn't be performed : ${action.request}`);
                    this._log('error', err);
                  });
                break;
              default:
                this._log('warning', 'The specified type of the action is incorrect. Authorized values : \'api\'');
                break;
            }
          }
        }
        res = await res.next();
      }
    }
  }

  // === Utils ===

  _log(type, message) {
    if (this.context.log[type] !== undefined && typeof this.context.log[type] === 'function') {
      this.context.log[type](`Plugin ${pluginName} -- ${message}`);
    }
  }
  /**
   * Throw BadRequestError if either name, condition or actions is missing
   */
  _checkAlarmPayload(data) {
    if (!data.name || !data.condition || !data.actions) {
      throw new this.context.errors.BadRequestError('Your alarm document must contain a name, a condition and an actions field');
    }
    return data;
  }

  /**
   * Formats the action request. All values with the following format '{path}' will be replaced
   * with the actual value of the specified path from the given data.
   */
  _formatRequest(request, data) {
    for (const key in request) {
      if (typeof request[key] === 'object') {
        this._formatRequest(request[key], data);
      } else {
        request[key] = request[key].replace(/{([^}]*)}/g, (match, p1) => {
          return _.get(data, p1, match);
        });
      }
    }
  }
}

module.exports = CorePlugin;
