import * as React from "react";
import * as ReactDOM from "react-dom";


import './index.scss';

let node = document.querySelector('#root')!;
import {App} from "./app"
ReactDOM.render(<App />, node);
