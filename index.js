
module.exports = () => {
  if (process) {
    const ForNode = require('./src/node')
    return new ForNode()
  } else {
    console.error(`not available in browser`)


  }
}