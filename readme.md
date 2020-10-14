# just-stopwatch

可用于测量代码运行时间

Measuring code execution time

**测量得出的时间 = 测量代码时间 + 目标代码运行时间**

**measure time = stopwatch execution time + target code execution time**

**测量代码时间 可能约为 1ms ~ 3ms**

**stopwatch execution time cost about 1ms ~ 3ms**

[x] Node.js > 8.0 (maybe support the older version)
[ ] Browser
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

// 多次获取间隔时间
// multi slice
const sw = stopwatch.Start()
doSth()
console.log(sw.Slice()) // Start 是最早的一个 slice
doSth(2e3)
console.log(sw.Slice()) // 距离上一个 Slice() 已经过去了多少时间
console.log(sw.Stop(), 'ms') // 3000 ms

// 多次获取计时结果
const sw = stopwatch.Start()
doSth() // 1e3 ms
console.log(sw.Split()) // 1000
doSth(2e3)
console.log(sw.Split()) // 3000
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
sw.On('Countdown/timeout', ({ ms }) => {
  console.log('倒计时实际超时时间',ms)
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

# Methods

## 计时方法

`Start()`

开始

Returns `Stopwatch`



`Stop()`

停止

Returns `number` 开始至停止的时间

`Pause()`

暂停

Returns `number` 开始至暂停的时间

`Continue()`

继续

Returns `number` 开始至暂停的时间

`Split()`

立即获取当前计时

Returns `number` 开始至现在的时间

`Slice()`

获取本次分割的时间

Returns `number` 距离上次 `Slice()` 的时间。`Start()` 为最早的一次 `Slice()`


`Restart()`

重置计时

Returns `Stopwatch`

## 倒计时

`Countdown(ms)`

开始

`ms`:`number` 倒计时间，毫秒

Returns `Stopwatch`

`CountdownPause()`

暂停

Returns `number` 剩余时间

`CountdownContinue()`

继续

Returns `number` 剩余时间

`CountdownRemain()`

获取剩余时间

Returns `number` 剩余时间

`CountdownRestart(ms)`

倒计时重置。可以中断已有的倒计时

`ms`:`number` 倒计时间，毫秒

Returns `Stopwatch`

## 事件监听

使用 `On(event,callback)` 进行事件监听
| event             | callback args | 触发条件         | 回调参数解释    |
| ----------------- | ------------- | ---------------- | --------------- |
| Start             | `null`        | 计时开始时触发   |                 |
| Stop              | `{ms:number}` | 计时结束时触发   | ms:毫秒         |
| Countdown/timeout | `{ms:number}` | 倒计时超时时触发 | ms:实际超时时间 |

# Test
```shell
npm run test

```