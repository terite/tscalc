import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { RecoilRoot } from 'recoil';

import { ErrorCatcher } from './components/ErrorCatcher';
import { AppLoader } from './components/AppLoader';
import { GameDataLoader } from './components/GameDataLoader';
import { ToastPortal } from './components/ToastPortal';

import './index.css';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <ErrorCatcher>
    <RecoilRoot>
      <GameDataLoader child={(gameData) => <AppLoader gameData={gameData} />} />
      <ToastPortal />
    </RecoilRoot>
  </ErrorCatcher>
);
