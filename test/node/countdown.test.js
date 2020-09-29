/* global  describe it  */
const stopwatch = require('../../index')
const expect = require('chai').expect
describe(`倒计时`, function () {
  this.timeout(6e4)
  it(`倒计 3e3 , on Countdown/timeout`, function (done) {
    // return

    const sw = stopwatch()

    sw.On(`Countdown/timeout`, ({ ms }) => {
      console.log(sw.label)
      console.log('Countdown/timeout-1', ms)
      expect(ms).gte(3e3).lte(4e3)
      done()
    })
      .Countdown(3e3)
  })
  it(`倒计时重启`, (done) => {
    // return
    const sw = stopwatch()
    sw.On('Countdown/timeout', ({ ms }) => {
      console.log(sw.label)

      console.log('Countdown/timeout-2', ms)
      expect(ms).gte(2e3).lte(3e3)
      done()
    })
    sw.Countdown(4e3)
    sw.CountdownRestart(2e3)
  })
  it(`设置 5e3 开始, 1e3 后剩余 4e3 暂停 2e3 再继续倒计时`, (done) => {
    // return
    // 5e3 - 1e3 剩余 4e3 时暂停，然后再倒计时
    // 总倒计时 5e3，实际时间花销 5e3 + 2e3 
    const timeout = 5e3
    const sw = stopwatch()
    sw.On('Countdown/timeout', ({ ms, real_ms }) => {
      console.log(sw.label)
      console.log('Countdown/timeout-3', ms, real_ms)
      expect(ms).gte(timeout).lte(timeout + 1e3)
      done()
    })
    sw.Countdown(timeout)
    sw.Block(1e3) // -1e3 
    // ok

    sw.CountdownPause()
    sw.Block(1e3) // - 0e3 
    sw.CountdownContinue()

    // ok
    sw.CountdownPause()
    sw.Block(1e3) // -1e3 = 1e3
    sw.CountdownContinue() // <1e3

  })
})