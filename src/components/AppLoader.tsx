import * as React from "react"
import * as Sentry from '@sentry/browser';

import * as game from "../game"
import State, {AppState} from '../state'
import * as serialization from '../serialization'

import {App} from "./App"


interface State {
    crashMsg?: string
    loading: boolean
}

export class AppLoader extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props)

        this.state = {
            loading: true
        }

        fetch("landblock.json")
            .then((response) => response.json())
            .then((raw: any) => {
                const gameData = new game.GameData(raw)
                State.actions.replaceState({gameData})

                const urlState = serialization.getUrlState(gameData)
                if (urlState) {
                    // everything comes from url state
                    State.actions.replaceState(urlState)
                } else {
                    // Load just settings
                    const storageState = serialization.getLocalStorageState(gameData);
                    if (storageState) {
                        // everything comes from url state
                        State.actions.replaceState(storageState)
                    }
                }

                this.setState({loading: false})
            })
            .catch(error => {
                console.error('caught error', error);
                let errmsg: string;
                if (error.stack) {
                    errmsg = `\n${error.stack}`;
                } else {
                    errmsg = error.toString();
                }
                this.crash(errmsg);
            });
    }

    handleStateChange = (state: AppState) => {
        serialization.setUrlState(state);
        serialization.setLocalStorageState(state);
        return "";
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Catch errors in any components below and re-render with error message
        this.crash([
            "Component Stack:",
            errorInfo.componentStack,
            "",
            error && error.stack
        ].join("\n"))

        Sentry.withScope((scope) => {
            Object.keys(errorInfo).forEach(key => {
                scope.setExtra(key, errorInfo[key as keyof React.ErrorInfo]);
            });
            Sentry.captureException(error);
        });
    }

    crash(msg: string) {
        this.setState({
            crashMsg: msg
        })
    }

    render() {
        if (typeof this.state.crashMsg !== 'undefined') {
            return <div className="crashed">
                <h1>Crashed!</h1>
                <pre>{this.state.crashMsg}</pre>
            </div>
        } else if (this.state.loading) {
            return (
                <State.Provider>
                    <h1>Loading...</h1>
                </State.Provider>
            )
        } else {
            return (
                <State.Provider>
                    <State.Consumer>{this.handleStateChange}</State.Consumer>
                    <App />
                </State.Provider>
            )
        }
    }
}
