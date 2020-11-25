import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';

import { ErrorCatcher } from './components/ErrorCatcher';
import { AppLoader } from './components/AppLoader';
import { GameDataLoader } from './components/GameDataLoader';
import { ToastPortal } from './components/ToastPortal';

import './index.css';

ReactDOM.render(
  <ErrorCatcher>
    <RecoilRoot>
      <GameDataLoader child={(gameData) => <AppLoader gameData={gameData} />} />
      <ToastPortal />
    </RecoilRoot>
  </ErrorCatcher>,
  document.getElementById('root')
);
