import React from 'react';
import { render } from 'react-dom';
import axios from 'axios';

const config = {
  baseURL: 'http://localhost:3344'
}

const request = axios.create(config)

let root = document.getElementById("root");
const content = (
  <div>
    <button className="content" onClick={send}>点击我发送请求</button>
  </div>
)

// 添加请求拦截器 
request.interceptors.request.use(
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
);
// 添加请求拦截器 
request.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    console.log('请求拦截2', config);
    return config;
    // if (/localhost/.test(config.baseURL)){
    //   return Promise.reject('不准请求本地');
    // } else {
    //   return config;
    // }
  },
  function (error) {
    // 对请求错误做些什么
    console.log("请求拦截出错2")
    return Promise.reject(error);
  }
);

// 添加响应拦截器 
request.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    console.log("拦截响应1");
    response = { message: "响应数据被我替换了，啊哈哈哈" }
    return response;
  },
  function (error) {
    // 对响应错误做点什么
    console.log('60=>',error);
    // console.log("拦截响应出错1");
    return Promise.reject(error);
  }
);
// 添加响应拦截器 
request.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    console.log("拦截响应2");
    response = { message: "响应数据被我替换了，啊哈哈哈" }
    return response;
  },
  function (error) {
    // 对响应错误做点什么
    console.log('75=>',error);
    // console.log("拦截响应出错1");
    return Promise.reject(error);
  }
);

function send() {
  request({
    method: 'get',
  }).then(res => {
    console.log(res)
  })
}

render(content, root);