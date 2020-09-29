import Stopwatch from './src/browser'
const stopwatch = () => {
  if (!performance || typeof performance.now !== 'function') {
    return console.error('not available in browser')
  }
  return new Stopwatch()
}
export default stopwatch 