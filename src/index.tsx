import * as React from "react";
import * as ReactDOM from "react-dom";

import {App} from "./app"

import './style.css';

let node = document.querySelector('#app')!;

while (node.firstChild) {
    node.removeChild(node.firstChild);
}

ReactDOM.render(<App />, node);
