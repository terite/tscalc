import * as React from "react";
import * as ReactDOM from "react-dom";


import './style.css';

let node = document.querySelector('#app')!;

while (node.firstChild) {
    node.removeChild(node.firstChild);
}

import {App} from "./app"
ReactDOM.render(<App />, node);
