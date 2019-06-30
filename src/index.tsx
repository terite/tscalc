import * as Sentry from '@sentry/browser';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ErrorCatcher } from './components/ErrorCatcher';
import { AppLoader } from './components/AppLoader';

if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: 'https://2ab99c1e02a448cbaa06595164416044@sentry.io/1385727',
    });
}

ReactDOM.render(
    <React.StrictMode>
        <ErrorCatcher>
            <AppLoader />
        </ErrorCatcher>
    </React.StrictMode>,
    document.getElementById('root')
);
