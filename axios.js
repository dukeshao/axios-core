const methodsArr = ['get', 'delete', 'head', 'options', 'put', 'patch', 'post'];


// 拦截器
class InterceptorsManage {
  constructor() {
    this.handlers = [];
  }

  use(fullfield, rejected) {
    this.handlers.push({
      fullfield,
      rejected
    })
  }
}

class Axios {
  constructor() {
    this.interceptors = {
      request: new InterceptorsManage,
      response: new InterceptorsManage
    }
  }

  request(config) {
    // 拦截器和请求组装队列 
    let chain = [this.sendAjax.bind(this), undefined] // 成对出现的，失败回调暂时不处理 

    // 请求拦截 
    this.interceptors.request.handlers.forEach(interceptor => {
      chain.unshift(interceptor.fullfield, interceptor.rejected)
    })

    // 响应拦截 
    this.interceptors.response.handlers.forEach(interceptor => {
      chain.push(interceptor.fullfield, interceptor.rejected)
    })

    // 执行队列，每次执行一对，并给promise赋最新的值 
    let promise = Promise.resolve(config);
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift())
    }
    return promise;
  }
  sendAjax(config) {
    return new Promise((resolve, reject) => {
      const { url = '', method = 'get', data = {} } = config;
      // 发送ajax请求 
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status !== 200) {
          // reject(xhr.status,xhr.statusText)
          reject("请求出错,状态码:" + xhr.status + ',描述:'+xhr.statusText)
        }
        if (xhr.readyState === 4 && xhr.status == 200) {
          resolve(JSON.parse(xhr.responseText));
        }
      }
      // xhr.onload = function () {
      //   resolve(JSON.parse(xhr.responseText));
      // };
      xhr.send(data);
    })
  }
}

// 将各种请求方式绑定在Axios原型上
methodsArr.forEach(met => {
  Axios.prototype[met] = function () {
    console.log('执行' + met + '方法');
    // 处理单个方法
    if (['get', 'delete', 'head', 'options'].includes(met)) { // 2个参数(url[, config])
      return this.request({
        method: met,
        url: arguments[0],
        ...arguments[1] || {}
      })
    } else { // 3个参数(url[,data[,config]])
      return this.request({
        method: met,
        url: arguments[0],
        data: arguments[1] || {},
        ...arguments[2] || {}
      })
    }
  }
})



// 将b的方法混入到a
const utils = {
  extend(a, b, context) {
    for (let key in b) {
      if (b.hasOwnProperty(key)) {
        if (typeof b[key] === 'function') {
          a[key] = b[key].bind(context);
        } else {
          a[key] = b[key]
        }
      }
    }
  }
}


function CreateAxiosFn() {
  let axios = new Axios();
  let req = axios.request.bind(axios);
  utils.extend(req, Axios.prototype, axios)
  utils.extend(req, axios)
  return req;
}
const axios = CreateAxiosFn();

export default axios
