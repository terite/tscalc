import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { RecoilRoot } from 'recoil';

import { ErrorCatcher } from './components/ErrorCatcher';
import { AppLoader } from './components/AppLoader';
import { GameDataLoader } from './components/GameDataLoader';

import './index.css';

const JSON_PATH = `${process.env.PUBLIC_URL}/assets/kras-18.json`;

ReactDOM.render(
  <ErrorCatcher>
    <RecoilRoot>
      <GameDataLoader
        jsonPath={JSON_PATH}
        child={(gameData) => <AppLoader gameData={gameData} />}
      />
    </RecoilRoot>
  </ErrorCatcher>,
  document.getElementById('root')
);
