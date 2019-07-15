class CorePlugin {
  constructor() {
    /**
     * @type {PluginContext}
     */
    this.context = null;

    this.config = {
    };

    this.hooks = {
      'document:afterCreateOrReplace': 'checkAlarm',
      'document:afterCreate': 'checkAlarm'
    };

    this.pipes = {
      'document:beforeCreate': 'registerAlarm',
      'document:beforeCreateOrReplace': 'registerAlarm'
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

  async registerAlarm(request) {
    const { collection } = request.input.resource,
      doc = request.input.body;
    if (collection === 'alarms') {
      this.context.log.info('Registering an alarm');
      const res = await this.koncorde.register(doc.condition.index, doc.condition.collection, doc.condition.filter);
      doc.filterId = res.id;
    }

    return request;
  }

  async checkAlarm(request) {
    const { index, collection } = request.input.resource,
      doc = request.input.body,
      sdk = this.context.accessors.sdk;

    const ids = await this.koncorde.test(index, collection, doc);
    // Search for returned id. If any, execute action
    for (const id of ids) {
      const query = { query: { match: { filterId: id } } };
      const res = await sdk.document.search(index, 'alarms', query);

      //Handle several hits TODO
      const actions = res.hits[0]._source.actions;
      for (const action of actions) {
        switch (action.type) {
          case 'api':
            this._formatRequest(action.request, doc);
            await sdk.query(action.request);
            break;
          default:
            this.context.log.warning('The specified type of the action is incorrect. Authorized values : \'api\'');
            break;
        }
      }
    }
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
        request[key] = request[key].replace(/{([^}]*)}/g, (_match, p1) => {
          const path = p1.split('.');
          let value = data;
          path.forEach(middleKey => { value = value[middleKey]; });
          return value;
        });
      }
    }
  }
}

module.exports = CorePlugin;
