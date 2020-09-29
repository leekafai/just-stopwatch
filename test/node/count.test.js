/* global  describe it  */
const stopwatch = require('../../index')
const expect = require('chai').expect

describe('计时', function () {
  this.timeout(6e4)
  describe('Slice', function () {
    it('1e3,2e3,3e3,总共 6e3', function (done) {
      const w = stopwatch().Start()
      w.Block(1e3)
      const s1 = w.Slice()
      console.log(s1, 's1')
      expect(s1).gte(1e3)
      w.Block(2e3)
      const s2 = w.Slice()
      console.log(s2, 's2')
      expect(s2).gte(2e3).lte(3e3)
      w.Block(3e3)
      const lastSlice = w.Slice()
      expect(lastSlice).lte(4e3)
      const ms = w.Stop()
      console.log(ms, 'Stop', lastSlice, 'lastSlice')
      expect(ms).gte(6e3).lt(7e3)
      done()
    });
  })

  describe('Start Stop', function () {
    it('2e3 执行任务，返回大于2e3', function (done) {
      const w = stopwatch().Start()
      w.Block(2e3)
      const ms = w.Stop()
      console.log(ms, '>>>>>>>')
      expect(ms).gte(2e3)
      done()
    });
  })

  describe('Pause Continue', function () {
    it('1e3 后暂停 3e3 , 再恢复，执行 1e3。有效计时 2e3', function (done) {
      const w = stopwatch().Start()
      w.Block(1e3)
      w.Pause()
      w.Block(3e3)
      w.Continue()
      w.Block(1e3)
      const ms = w.Stop()
      console.log(ms, '>>>>>>>')
      expect(ms).gte(2e3).lt(3e3)
      done()
    });
  })
  describe('Split', () => {
    it(`1e3,2e3,3e3,total 6e3`, (done) => {
      const w = stopwatch().Start()
      w.Block(1e3)
      expect(w.Split()).gte(1e3)
      w.Block(2e3)
      expect(w.Split()).gte(3e3)
      w.Block(3e3)
      const lastSplit = w.Split()
      expect(lastSplit).gte(6e3)
      const ms = w.Stop()
      console.log(ms, 'Stop', lastSplit, 'lastSplit')
      expect(ms).gte(6e3).lt(7e3)
      done()
    })
  })

  describe('Restart', function () {
    it('计时 2e3 后 重置计时 1e3', function (done) {
      const w = stopwatch().Start()
      w.Block(2e3)
      w.Stop()
      w.Restart()
      w.Block(1e3)
      const ms = w.Stop()
      console.log(ms, '>>>>>>>')
      expect(ms).gte(1e3).lt(2e3)
      done()
    });
  })
  describe('Restart On(Stop', function () {
    it('计时 2e3 后 重置计时 1e3。使用 On Stop', function (done) {
      const w = stopwatch().Start().On(`Stop`, ({ ms }) => {
        console.log(ms, '首次 on')
        expect(ms).gte(2e3).lt(3e3)
        done()
      })
      w.Block(2e3)
      w.Stop()
      w.Restart().On(`Stop`, ({ ms }) => {
        console.log(ms, '二次 on')
        expect(ms).gte(1e3).lt(2e3)
      })
      w.Block(1e3)
      w.Stop()
    });
  })
});

