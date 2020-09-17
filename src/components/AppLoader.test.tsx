import React from 'react';
import ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';
import { AppLoader } from './AppLoader';

it('renders without crashing', () => {
  const div = document.createElement('div');
  const gameData = {} as any;
  ReactDOM.render(
    <RecoilRoot>
      <AppLoader gameData={gameData} />
    </RecoilRoot>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
