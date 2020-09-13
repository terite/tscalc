import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import { AppLoader } from './AppLoader';
import { StateProvider } from '../state';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const gameData = {} as any;
  ReactDOM.render(
    <RecoilRoot>
      <StateProvider children={<AppLoader gameData={gameData} />} />
    </RecoilRoot>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
