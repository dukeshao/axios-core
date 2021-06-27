# Axios核心原理解析

### 使用者 - 导入axios

```js
import axios from 'axios';
```

### axios源码 - 创建axios实例/返回axios实例

```js
// axios.js
var axios = createInstance(defaults);
module.exports.default = axios;
```

我们导入的是利用默认配置生成的一个axios实例

### 使用者 - 配置实例基本配置

```js
const config = {
    baseURL: 'http://localhost:3344'
}

const request = axios.create(config)
```

### axios源码 - 合并实例配置和默认配置/创建新的实例并返回

```js
axios.create = function create(instanceConfig) {
    return createInstance(mergeConfig(axios.defaults, instanceConfig));
};
```

优先级顺序：请求配置>实例配置>默认配置

### 使用者 - 得到新实例，命名为request

```js
const request = axios.create(config)
```

### 使用者 - 设置请求/响应拦截

```js
// 添加请求拦截器
request.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    console.log('请求拦截1', config);
    return config;
}, function (error) {
    // 对请求错误做些什么
    console.log("请求拦截出错1")
    return Promise.reject(error);
});

// 添加请求拦截器
request.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    console.log('请求拦截2', config);
    return config;
}, function (error) {
    // 对请求错误做些什么
    console.log("请求拦截出错2")
    return Promise.reject(error);
});

// 添加响应拦截器
request.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    console.log("拦截响应1");
    response = { message: "响应数据被我替换了，啊哈哈哈" }
    return response;
}, function (error) {
    // 对响应错误做点什么
    console.log(error);
    console.log("拦截出错1");
    return Promise.reject(error);
});
```

### axios源码 - 存储请求/响应拦截到interceptors

```js
// 拦截器构造函数
function InterceptorManager() {
    this.handlers = [];
}
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
    this.handlers.push({
        fulfilled: fulfilled,
        rejected: rejected
    });
    return this.handlers.length - 1;
};

// 请求拦截和响应拦截均是拦截器的实例化
function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager()
    };
}

// 用数组存储执行链
var chain = [dispatchRequest, undefined];
var promise = Promise.resolve(config);
// 将请求拦截成对推入执行链的头部
// 知道这个原理以后，我们就知道在设置多个请求拦截时，会按照设置时的顺序，倒序处理
this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
});
// 将响应拦截成对推入执行链的尾部，执行时按照设置时的顺序，正序处理
this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
});
// 依次成对执行，并用新的promise代替旧的promise，最后返回最新的promise
while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
}
return promise;
```

重点分析：promise = promise.then(chain.shift(), chain.shift());

```js
var promise = Promise.resolve(config);
while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
}
return promise;

```

我们将以上代码，按照流程顺序将while语句根据实际情况拆解，更能理解以上代码的精髓

```js
var promise = Promise.resolve(config);

promise = promise.then(
    function (config) {
        // 在发送请求之前做些什么
        console.log('请求拦截2', config);
        return config;
    },
    function (error) {
        // 对请求错误做些什么
        console.log("请求拦截出错2")
        return Promise.reject(error);
    }
)

promise = promise.then(
    function (config) {
        // 在发送请求之前做些什么
        console.log('请求拦截1', config);
        return config;
    },
    function (error) {
        // 对请求错误做些什么
        console.log("请求拦截出错1")
        return Promise.reject(error);
    }
)

promise = promise.then(
    dispatchRequest,
    undefined
)

promise = promise.then(
    function (response) {
        // 对响应数据做点什么
        console.log("拦截响应1");
        response = { message: "响应数据被我替换了，啊哈哈哈" }
        return response;
    },
    function (error) {
        // 对响应错误做点什么
        console.log(error);
        console.log("拦截出错1");
        return Promise.reject(error);
    }
)

return promise;
```

其实质就是一个promise的链式调用，如果执行过程中没有调用Promise.reject，将按照resolve路线走，一旦调用Promise.reject，将执行后面的所有reject函数

### 思考1：为什么需要使用者在reject函数中手动调用Promise.reject？

### 思考2：为什么需要使用者在请求拦截resolve函数中一直return config？

## 取消请求的实现

### 使用者 - 使用

```js
// src/api.js
export function checkTask (parameter, others) {
  return request({
    url: projectApi.checkTask,
    method: 'post',
    data: parameter,
    ...others
  })
}

// view/components/view.jsx
import request from '@axios/myRequest'
import { checkTask } from '@src/api'
const source = request.CancelToken.source();// 实例化

// 发出请求
checkTask(formData, { cancelToken: source.token }).then(res=>{
    console.log(res)
})

// 关闭请求弹窗时，或其他操作，需要取消请求时
function cancelCheckTask(){
   source.cancel('cancel msg');
}

```



### axios源码 - axios.CancelToken.source()做了啥

```js
CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
        cancel = c;
    });
    return {
        token: token,
        cancel: cancel
    };
};
```

创建了一个 CancelToken 实例给 token,

CancelToken 的参数是一个函数executor，

将函数executor的参数c再赋值给 cancel

将 { token: token,cancel: cancel } 作为新对象返回

cancel是一个函数，执行时将取消带有当前token标记的请求

### axios源码 - CancelToken又做了啥

```js
function CancelToken(executor) {
    if (typeof executor !== 'function') {
        throw new TypeError('executor must be a function.');
    }

    var resolvePromise;
    this.promise = new Promise(function promiseExecutor(resolve) {
        resolvePromise = resolve;
    });

    var token = this;
    executor(function cancel(message) {
        if (token.reason) {
            // Cancellation has already been requested
            return;
        }

        token.reason = new Cancel(message);
        resolvePromise(token.reason);
    });
}
```

创建了一个 Promise , 同时保存 Promise resolve 的具体实现

执行上一步传递的函数 executor ，

并将取消操作的具体实现函数 作为参数传递给 executor ,

executor将其赋值给 cancel 传递给用户

取消操作是执行了Promise.resolve

同时将用户设定的 message 封装后作为结果返回给 then 的实现

其实都是进行了promise上的操作流程：

=> source实例化时将取消函数cancel抛给用户，而cancel函数内有一个待定的resolve函数（resolvePromise）

=> 发送请求时再将onCanceled定义为cancel函数内的待定resolve函数

### axios源码 - 发送请求时

```js
// xhr.js

if (config.cancelToken) {
    // Handle cancellation
    config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
            return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
    });
}
```

