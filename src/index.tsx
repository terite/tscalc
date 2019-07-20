import * as Sentry from '@sentry/browser';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ErrorCatcher } from './components/ErrorCatcher';
import { AppLoader } from './components/AppLoader';
import { StateProvider } from './state';

// https://bootswatch.com/4/slate/bootstrap.css
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://2ab99c1e02a448cbaa06595164416044@sentry.io/1385727',
  });
}

ReactDOM.render(
  <ErrorCatcher>
    <StateProvider>
      <AppLoader />
    </StateProvider>
  </ErrorCatcher>,
  document.getElementById('root')
);
