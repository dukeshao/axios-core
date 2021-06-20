import React from 'react';
import { render } from 'react-dom';
import axios from './axios';

let root = document.getElementById("root");
let baseUrl = 'http://localhost:3355'
const content = (
  <div>
    <button className="content" onClick={send}>点击我发送请求</button>
  </div>
)

// 添加请求拦截器 
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么 
  console.log('发送ajax请求', config);
  return config;
}, function (error) {
  // 对请求错误做些什么 
  // console.log("请求出错了啦")
  return Promise.reject(error);
});

// 添加响应拦截器 
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么 
  // console.log("被我响应拦截拦截了，哈哈 ");
  response = { message: "响应数据被我替换了，啊哈哈哈" }
  return response;
}, function (error) {
  // 对响应错误做点什么 
  console.log(error);
  return Promise.reject(error);
});

function send() {
  axios({
    method: 'get',
    url: baseUrl + '/option/nameList2'
  }).then(res => {
    console.log(res)
  })
  .catch(err=>{
    // console.log("catch error",err)
  })
}

render(content, root);