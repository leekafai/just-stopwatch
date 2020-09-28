/* global  describe it  */
const stopwatch = require('../index')
const expect = require('chai').expect
const sleep = (ms = 2e3) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
describe('计时', function () {
  this.timeout(6e4)
  describe('Start Stop', function () {
    it('2e3 执行任务，返回大于2e3', function () {
      const w = stopwatch().Start()
      sleep(2e3)
      const ms = w.Stop()
      console.log(ms, '>>>>>>>')
      expect(ms).gte(2e3)
    });
  })

  describe('Pause Continue', function () {
    it('1e3 后暂停 3e3 , 再恢复，执行 1e3。有效计时 2e3', function () {
      const w = stopwatch().Start()
      sleep(1e3)
      w.Pause()
      sleep(3e3)
      w.Continue()
      sleep(1e3)
      const ms = w.Stop()
      console.log(ms, '>>>>>>>')
      expect(ms).gte(2e3).lt(3e3)
    });
  })
  describe('Split', function () {
    it('1e3,2e3,3e3,总共 6e3', function () {
      const w = stopwatch().Start()
      sleep(1e3)
      expect(w.Split()).gte(1e3).lt(2e3)
      sleep(2e3)
      expect(w.Split()).gte(2e3).lt(3e3)
      sleep(3e3)
      expect(w.Split()).gte(3e3).lt(4e3)
      const ms = w.Stop()
      console.log(ms, '>>>>>>>')
      expect(ms).gte(6e3).lt(7e3)
    });
  })
  describe('Restart', function () {
    it('计时 2e3 后 重置计时 1e3', function () {
      const w = stopwatch().Start()
      sleep(2e3)
      w.Stop()
      w.Restart()
      sleep(1e3)
      const ms = w.Stop()
      console.log(ms, '>>>>>>>')
      expect(ms).gte(1e3).lt(2e3)
    });
  })
});

