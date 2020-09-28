const ForNode = require('./src/node')
module.exports = () => {
  if (process) {
    return new ForNode()
  }
}