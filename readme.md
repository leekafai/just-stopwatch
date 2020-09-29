# just-stopwatch

可用于测量代码运行时间

Measuring code execution time

**测量得出的时间 = 测量代码时间 + 目标代码运行时间**

**measure time = stopwatch execution time + target code execution time**

**测量代码时间 可能约为 1ms ~ 3ms**

**stopwatch execution time cost about 1ms ~ 3ms**

- [x] Node.js > 8.0 (maybe support the older version)
- [ ] Browser
# Install

```shell
npm i just-stopwatch
```

# Usage

```javascript
const stopwatch = require('just-stopwatch')

const doSth = (ms=1e3)=> {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// 简单地测量一下代码运行耗时
// simply measure `doSth()` execution time
const sw = stopwatch.Start()
doSth(3e3)
const cost = sw.Stop()
console.log(cost, 'ms') // 3000 ms

// 多次获取时间
// multi split
const sw = stopwatch.Start()
doSth()
console.log(sw.Split()) // Start 是最早的一个 Split
doSth(2e3)
console.log(sw.Split()) // 距离上一个 Split() 已经过去了多少时间
console.log(sw.Stop(), 'ms') // 3000 ms

// 暂停后继续
// pause and continue
const sw = stopwatch.Start()
doSth()
console.log(sw.Pause()) // 暂停测量
doSth(2e3) // be ignored
console.log(sw.Continue()) // 继续测量
doSth()  
console.log(sw.Stop(), 'ms') // 三次 doSth()，但第二次没有测量

// 倒计时
// Countdown
const sw = stopwatch()
sw.On(`Countdown/timeout`, ({ ms}) => {
  console.log(ms,'实际超时时间，必然大于设定时间')
})
.Countdown(3e3) // 设置了 3 秒，则 timeout 回调时间 必然 大于 设定时间

// 倒计时重启
const sw = stopwatch().On('Countdown/timeout', ({ ms }) => {
   console.log(ms) // 2e3 因为倒计时被重新设定
})
sw.Countdown(4e3) // 设定 4 秒倒计时
sw.CountdownRestart(2e3) // 立即将倒计时设定为 2 秒

// 倒计时暂停后继续

const timeout = 5e3
const sw = stopwatch()
sw.On('Countdown/timeout', ({ ms, real_ms }) => {
  console.log('倒计时实际超时时间',ms)
  console.log('真实世界消耗时间',real_ms) // 比 ms 多出了暂停到继续之间的时间
})
sw.Countdown(timeout) // 5s
doSth(1e3) 
sw.CountdownPause() // 经过 1s 后暂停
doSth(1e3) 
sw.CountdownContinue() // 经过 1s 后继续
sw.CountdownPause() // 立即暂停
doSth(1e3) 
sw.CountdownContinue() // 经过一秒后继续

```




# Test
```shell
npm run test

```