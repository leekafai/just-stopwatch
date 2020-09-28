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
    this._split_hr = null
    this._pause_ms = 0
    this._pause_hr = null
    this._countdown_remain = 0
    this._countdown_ms = null
    this._countdown_need_continue = false
    return this
  }
  /**
   * 
   * 监听事件
   * @param {string} event - 事件名称 
   * @example
   * ```
   * .On('Start') // 开始时回调
   * .On('Countdown/timeout') // 倒计时结束时回调
   * ```
   * 
   * @param {function} callback - 回调
   */
  On(event = '', callback) {
    this.event.on(event, (d) => {
      typeof callback === 'function' && callback(d)
    })
    return this
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
    if (this.countdown_timeout['_idleTimeout']) {
      // 存在计时器，释放重置
      clearTimeout(this.countdown_timeout)
    }
    return this.Reset().Countdown(ms || this._countdown_ms)
  }
  _CountdownTimeoutEmit() {
    const d = {
      ms: this._hrtime2ms(process.hrtime(this._start_hr), -this.CountdownRemain())
    }
    this.event.emit('Countdown/timeout', d)
    clearTimeout(this.countdown_timeout)
  }
  /**
   * 设置倒计时，并立即开始倒数
   * @param {number} [ms] - 设置倒计时时间，毫秒
   * @param {function} [callback] - 回调 callback。等同于 .On("Countdown/timeout")
   * 
   */
  Countdown(ms) {
    const self = this
    this.Start()
    this.countdown_timeout = setTimeout(() => {
      self._CountdownTimeoutEmit()
    }, ms)
    this._countdown_ms = ms
    // const now_hr = process.hrtime(this._start_hr)
    return this
  }
  /**
   * 倒计时剩余时间
   * @returns {number} 剩余倒计时
   */
  CountdownRemain() {
    if (!this._start_hr) throw new Error(this.TIPS['NOT_STARTED'])
    if (this._countdown_need_continue) {
      return this._countdown_remain
    }
    const remain = this._hrtime2ms(process.hrtime(this._start_hr), -this._countdown_ms)
    return (-remain)
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
    if (this.countdown_timeout['_idleTimeout']) {
      // 暂停倒计时
      clearTimeout(this.countdown_timeout)
      const remain = this.CountdownRemain()
      // 记录倒计时需要恢复
      this._countdown_need_continue = true
      // 记录倒计时剩余时间
      this._countdown_remain = remain
    }
    return this._countdown_remain
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
    if (this._countdown_need_continue) {
      // 继续倒计剩余时间
      this.Countdown(this._countdown_remain)
    }
    return this._countdown_remain
  }
  /**
   * 开始计时
   * 
   */
  Start() {
    (this._start_hr = process.hrtime())
    this.event.emit('Start')
    return this
  }

  /**
   * 获取上一个 split 至现在所耗费的时间
   * 可用于计算多个 func 分别运行的时间
   * 开始为默认的第一个 split
   * @example
   * ```
   * watch.Start()
   * func() // 100ms
   * watch.Split() //-> 100
   * await func2() // 200ms
   * watch.Split() // -> 200
   * watch.Stop() // -> 300
   * ```
   * @returns - 距离上一个 split 所耗费的时间
   */
  Split() {
    if (!this._start_hr) {
      throw new Error(this.TIPS['NOT_STARTED'])
    }
    const split = process.hrtime(this._split_hr || this._start_hr)
    this._split_hr = process.hrtime()
    return this._hrtime2ms(split)
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
    clearTimeout(this.countdown_timeout)
    const total_ms = this._calc2ms()
    this.event.emit('Stop', { ms: total_ms })
    this.event.removeAllListeners()
    this.Reset()
    return total_ms
  }
}
module.exports = Stopwatch