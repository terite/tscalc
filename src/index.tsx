declare var process: {
    env: {
        NODE_ENV: string;
    };
};

import * as Sentry from '@sentry/browser';
if (process.env.NODE_ENV === 'production') {
    Sentry.init({
        dsn: 'https://2ab99c1e02a448cbaa06595164416044@sentry.io/1385727',
    });
}

import * as React from 'react';
import * as ReactDOM from 'react-dom';

const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

import { ErrorCatcher } from './components/ErrorCatcher';
import { AppLoader } from './components/AppLoader';
ReactDOM.render(
    <React.StrictMode>
        <ErrorCatcher>
            <AppLoader />
        </ErrorCatcher>
    </React.StrictMode>,
    root
);
