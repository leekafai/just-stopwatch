# just-stopwatch

可用于测量代码运行时间

Measuring code execution time

- [x] Node.js > 8.0 (maybe support the older version)
- [ ] Browser
# Install

```shell
npm i https://github.com/leekafai/just-stopwatch.git
```

# Test
```shell
npm run test

```

# Usage

```javascript
const stopwatch = require('just-stopwatch')

const doSth = (ms=1e3)=> {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// simply measure `doSth()` execution time
// 简单地测量一下代码运行耗时
const sw = stopwatch.Start()
doSth(3e3)
const cost = sw.Stop()
console.log(cost, 'ms') // 3000 ms

// 多次获取时间
// multi split
const sw = stopwatch.Start()
doSth()
console.log(sw.Split()) // 1000 time between start
doSth(2e3)
console.log(sw.Split()) // 2000 time between the last split
console.log(sw.Stop(), 'ms') // 3000 ms

// 暂停后继续
// pause and continue
const sw = stopwatch.Start()
doSth()
console.log(sw.Pause()) // 1000  has been measured time
doSth(2e3) // be ignored
console.log(sw.Continue()) // 1000  has been measured time
doSth() // 2000 has been measured time  
console.log(sw.Stop(), 'ms') // 2000 ms
```