const events = require('events');

/**
 * 秒表
 * 
 * 支持：倒计时，打点计时，暂停计时
 * @author leekafai
 * @example
 * ```
 * const Stopwatch=require('./stopwatch')
 * const watch=Stopwatch()
 * watch.Start()
 * watch.Stop()
 * ```
 */
class Stopwatch {
  constructor(label = Math.random()) {
    this.label = label
    this.Reset()
    this.event = new events.EventEmitter();
    this.TIPS = {
      'NOT_STARTED': '⚠ Stopwatch is not started, use .Start()',
      'NO_COUNTDOWN': '⚠ use .Countdown(ms)',
      'IS_STARTED': '⚠ Stopwatch is started, use .Restart() to restart'
    }

  }

  /**
   * 重置秒表
   * 
   * 需要显式调用 `.Start()` 重新开始计时，或调用 `.Countdown()` 重新开始倒计时
   */
  Reset() {
    this._start_hr = null
    this._slice_hr = null
    this._pause_ms = 0
    this._pause_hr = null

    this._codn_pause_ms = 0
    this._codn_pause_ms = 0
    this._codn_remain = 0
    this._codn_target_ms = null
    this._codn_pause_flag = false
    this._codn_pause_hr = null
    return this
  }
  /**
   * 
   * 监听事件
   * @param {string} event - 事件名称 
   * @param {function} callback - 回调
   * @example
   * ```
   * .On('Start') // 开始时回调
   * .On('Countdown/timeout') // 倒计时结束时回调
   * ```
   */
  On(event = '', callback) {
    this.event.on(event, (d) => {
      typeof callback === 'function' && callback(d)
    })
    return this
  }
  /**
   * 同步堵塞
   * 
   * ⚠ 同步堵塞，谨慎使用 ⚠
   * @param {number} [ms] 
   */
  Block(ms = 1e3) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  }
  /**
   * 异步堵塞
   * @param {number} [ms] 
   */
  async AsyncBlock(ms = 1e3) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, ms)
    })
  }
  /**
   * 
   * @param {array} hrtime process.hrtime()
   * @param {number} ms + 额外的毫秒
   * @private
   */
  _hrtime2ms(hrtime = [], ms = 0) {
    if (!hrtime || !Array.isArray(hrtime)) return 0
    const [s = 0, ns = 0] = hrtime
    return Math.floor(((s * 1e3) + (ns / 1e6) + ms) * 1e2) / 1e2
  }
  /**
   * 获取计时器的完整记录时间（排除暂停区间）
   * @private
   */
  _calc2ms() {
    const stop_hr = process.hrtime(this._start_hr)
    return this._hrtime2ms(stop_hr, this._pause_ms)
  }
  /**
   * 重置开始
   * @example
   * ```
   * .Restart(args) = .Reset().Start(args)
   * ```
   * 
   */
  Restart(...args) {
    return this.Reset().Start(args)
  }
  /**
   * 倒计时重置并开始
   * @param {number} ms 
   */
  CountdownRestart(ms) {
    if (this._codn_tout['_idleTimeout']) {
      // 存在计时器，释放重置
      clearTimeout(this._codn_tout)
    }
    return this.Reset().Countdown(ms || this._codn_target_ms)
  }
  /**
   * 倒计时触发超时
   */
  _CountdownTimeoutEmit() {
    // ms 实际用时 > 设置时间
    const realWorldMs = this._hrtime2ms(process.hrtime(this._codn_start_hr))
    const d = {
      ms: realWorldMs - this._codn_pause_ms,
      real_ms: realWorldMs
    }
    this.event.emit('Countdown/timeout', d)
    clearTimeout(this._codn_tout)
    this.Reset()
  }
  /**
   * 设置倒计时，并立即开始倒数
   * @param {number} [ms] - 设置倒计时时间，毫秒
   */
  Countdown(ms) {
    const self = this
    this.Start()
    this._codn_start_hr = this._codn_start_hr || process.hrtime()
    this._codn_tout = setTimeout(() => {
      self._CountdownTimeoutEmit()
    }, ms + 0.5)
    // 暂停后 Continue ，不改变最初的 target_ms
    this._codn_target_ms = this._codn_target_ms || ms
    return this
  }
  /**
   * 倒计时实际剩余时间
   * @returns {number} 剩余倒计时
   */
  CountdownRemain() {
    if (!this._start_hr) throw new Error(this.TIPS['NOT_STARTED'])
    if (this._codn_pause_flag) return this._codn_remain
    const passed = this._hrtime2ms(process.hrtime(this._codn_start_hr))
    if (this._codn_pause_ms) return this._codn_remain
    this._codn_remain = this._codn_target_ms - (this._codn_pause_ms || passed)
    return this._codn_remain
  }

  /**
   * 暂停计时。
   * `.Continue()` 再次计时
   * @returns {number|null} - 剩余倒计时时间
   */
  CountdownPause() {
    if (!this._start_hr) {
      throw new Error(this.TIPS['NOT_STARTED'])
    }
    if (this._codn_pause_flag) return this._codn_remain
    if (this._codn_tout['_idleTimeout']) {
      clearTimeout(this._codn_tout)

      // 剩余倒计时间,用于 continue 时生成新的定时器
      this._codn_remain = this._codn_remain || this.CountdownRemain()
      // 标记倒计时已暂停
      this._codn_pause_flag = true
      // 记录最近一次暂停倒计时的时间戳
      this._codn_pause_hr = process.hrtime()

    }
    return this._codn_remain
  }

  /**
   * 从暂停状态下恢复，继续计时
   * @example
   * ```
   * watch.Start()
   * func1() // 100ms
   * watch.Split() // -> 100
   * watch.Pause()
   * await func2() // 200ms
   * watch.Continue() //100
   * ```
   * @returns {number|null} - 剩余倒计时时间
   */
  CountdownContinue() {
    if (!this._start_hr) {
      throw new Error(this.TIPS['NOT_STARTED'])
    }
    if (this._codn_pause_flag) {
      this._codn_pause_flag = false
      // 累计调用暂停倒数时已经处理的暂停时长
      this._codn_pause_ms += this._hrtime2ms(process.hrtime(this._codn_pause_hr))
      // 继续倒计剩余时间
      this.Countdown(this._codn_remain)
    }
    // 关闭 暂停标记

    return this._codn_remain
  }
  /**
   * 开始计时
   * 
   */
  Start() {
    if (this._start_hr) {
      return this.Restart()
    }
    (this._start_hr = process.hrtime())
    this.event.emit('Start')
    return this
  }

  /**
   * 获取开始至到现在的时间
   * @example
   * ```
   * watch.Start()
   * func() // 100ms
   * watch.Split() //-> 100
   * await func2() // 200
   * watch.Split() // -> 300
   * watch.Stop() // -> 300
   * ```
   * @returns - 从开始到现在
   */
  Split() {
    if (!this._start_hr) {
      throw new Error(this.TIPS['NOT_STARTED'])
    }
    return this._calc2ms()
  }
  /**
   * 获取两个 Slice 之间的时间
   * 第一个 Slice 获取的值与 Split 相同
   * watch.Start()
   * func() // 100ms
   * watch.Slice() //-> 100
   * await func2() // 200
   * watch.Slice() // -> 200
   */
  Slice() {
    if (!this._start_hr) {
      throw new Error(this.TIPS['NOT_STARTED'])
    }
    const slice = this._hrtime2ms(process.hrtime(this._slice_hr || this._start_hr))
    this._slice_hr = process.hrtime()
    return slice
  }
  /**
   * 暂停计时。 
   * `.Continue()` 再次计时
   * @returns {number|null} - 暂停时的总计时
   */
  Pause() {
    if (!this._start_hr) {
      throw new Error(this.TIPS['NOT_STARTED'])
    }
    this._pause_hr = process.hrtime()
    return this._calc2ms()
  }
  /**
   * 从暂停状态下恢复，继续计时
   * @example
   * ```
   * watch.Start()
   * func1() // 100ms
   * watch.Split() // -> 100
   * watch.Pause()
   * await func2() // 200ms
   * watch.Continue() //100
   * ```
   * @returns {number|null} - 总计时
   */
  Continue() {
    if (!this._start_hr) {
      throw new Error(this.TIPS['NOT_STARTED'])
    }
    if (this._pause_hr) {
      this._pause_ms -= this._hrtime2ms(process.hrtime(this._pause_hr))
    }
    this._pause_hr = null
    return this._calc2ms()
  }
  /**
   * 停止计时，输出计时器结果
   * 关闭倒计时。
   * @example
   * ```
   * watch.Start()
   * func() // 100ms
   * watch.Stop() // -> 100
   * ```
   * @returns {number|null} - 总计时
   */
  Stop() {
    if (!this._start_hr) {
      throw new Error(this.TIPS['NOT_STARTED'])
    }

    this._codn_tout &&
      this._codn_tout['_idleTimeout'] &&
      clearTimeout(this._codn_tout)

    const total_ms = this._calc2ms()
    this.event.emit('Stop', { ms: total_ms })
    this.event.removeAllListeners()
    this.Reset()
    return total_ms
  }
}
module.exports = Stopwatch