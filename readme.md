# just-stopwatch

可用于测量代码运行时间

Measuring code execution time

# Install

```shell
npm i https://github.com/leekafai/just-stopwatch.git
```

# Test
```shell
npm run test

```

# Usage

## measure `doSth()` execution time

```javascript
const stopwatch = require('just-stopwatch')
const doSth = ()=> {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 3e3);
}
const sw = stopwatch.Start()
doSth()
const cost = sw.Stop()
console.log(cost, 'ms') // 3000 ms
```