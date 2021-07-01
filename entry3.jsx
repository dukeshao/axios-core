import React from 'react';
import { render } from 'react-dom';


let root = document.getElementById("root");

const content = (
  <div>
    <button className="content" onClick={send}>点击我发送请求</button>
    <div></div>
  </div>
)

render(content, root);