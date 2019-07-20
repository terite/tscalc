import React from 'react';
import ReactDOM from 'react-dom';
import { AppLoader } from './AppLoader';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<AppLoader />, div);
  ReactDOM.unmountComponentAtNode(div);
});
