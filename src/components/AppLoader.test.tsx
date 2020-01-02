import React from 'react';
import ReactDOM from 'react-dom';
import { AppLoader } from './AppLoader';
import { StateProvider } from '../state';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<StateProvider children={<AppLoader />} />, div);
  ReactDOM.unmountComponentAtNode(div);
});
