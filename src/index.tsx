import * as Sentry from '@sentry/browser';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';

import { ErrorCatcher } from './components/ErrorCatcher';
import { AppLoader } from './components/AppLoader';
import { GameDataLoader } from './components/GameDataLoader';
import { StateProvider } from './state';

import './index.css';

const JSON_PATH = `${process.env.PUBLIC_URL}/assets/kras-18.json`;

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://2ab99c1e02a448cbaa06595164416044@sentry.io/1385727',
  });
}

ReactDOM.render(
  <ErrorCatcher>
    <RecoilRoot>
      <StateProvider>
        <GameDataLoader
          jsonPath={JSON_PATH}
          child={(gameData) => <AppLoader gameData={gameData} />}
        />
      </StateProvider>
    </RecoilRoot>
  </ErrorCatcher>,
  document.getElementById('root')
);
