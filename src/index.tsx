import * as React from "react";
import * as ReactDOM from "react-dom";


import './index.scss';

let node = document.querySelector('#root')!;
import {AppLoader} from "./apploader"
ReactDOM.render(<AppLoader />, node);
