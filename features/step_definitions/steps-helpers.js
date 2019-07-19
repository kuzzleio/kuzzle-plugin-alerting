module.exports = {

  _sleep: function (ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // ASK eslint trick legal ? :p 

  /**
   * Improves rowsHash function by considering nested JSON
   * @param table result of rowsHash() function
   */
  _parseTable: function (table) {
    /* eslint-disable no-empty */
    for (const key of Object.getOwnPropertyNames(table)) {
      try {
        table[key] = JSON.parse(table[key]);
      } catch (e) {
      }
    }
    return table;
  }

};