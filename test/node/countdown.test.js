const stopwatch = require('../../index')
const expect = require('chai').expect
describe(`倒计时`, function () {
  this.timeout(6e4)
  it(`倒计 3e3 , on Countdown/timeout`, function (done) {
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
  it(`设置 5e3 开始, 1e3 后剩余 4e3 暂停 2e3 再继续倒计时`, async () => {
    // return
    // 5e3 - 1e3 剩余 4e3 时暂停，然后再倒计时
    // 总倒计时 5e3，实际时间花销 5e3 + 2e3 
    const timeout = 5e3
    const sw = stopwatch()
    const start = new Date().valueOf()
    sw.On('Countdown/timeout', async ({ ms }) => {
      console.log(sw.label)
      console.log('Countdown/timeout-3', ms)
      console.log(new Date().valueOf() - start, '>>>>>>>>')

      expect(ms).gte(timeout).lte(timeout + 1e3)
    })
    sw.Countdown(timeout)

    await sw.AsyncBlock(2e3) // -1e3 
    // ok

    const r = sw.CountdownPause() // 4e3
    console.log(r, 'first pause remain')
    console.log(sw.CountdownRemain())
    sw.Block(1e3) // - 0e3 
    const r2 = sw.CountdownContinue()
    console.log(r2)

    console.log('------------------2')
    // console.log(sw.CountdownRemain())
    // expect(r).lte(4e3)
    // console.log(r2, 'first continue remain')
    const r3 = sw.CountdownPause()
    console.log(r3, 'second pause remain')
    await sw.AsyncBlock(2e3)

    const r4 = sw.CountdownContinue() // <1e3
    console.log(r4, 'second continue remain', 4e3)

  })
})