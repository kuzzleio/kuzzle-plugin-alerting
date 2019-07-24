
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Improves rowsHash function by considering nested JSON
 * @param table result of rowsHash() function
 */
function parseTable(table) {
  /* eslint-disable no-empty */
  for (const key of Object.getOwnPropertyNames(table)) {
    try {
      table[key] = JSON.parse(table[key]);
    } catch (e) {
    }
  }
  return table;
}


module.exports = {
  sleep,
  parseTable
};