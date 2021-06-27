const config = {
  baseURL: 'http://localhost:8888'
}
var promise = Promise.resolve(config);

promise = promise.then(
  function (config) {
    // 在发送请求之前做些什么
    console.log('请求拦截2', config);
    // return config;
    if (/localhost/.test(config.baseURL)){
      return Promise.reject('不准请求本地');
    } else {
      return config;
    }
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
  function (response) {
    console.log('请求', response);
    return {response:{code:'0'}};
  },
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
    // console.log("拦截响应出错1");
    return Promise.reject(error);
  }
)

console.log("final promise",promise.then(res=>console.log("final res=>",res)))
// return promise;