import * as React from "react"

import * as game from "./game"

import {App} from "./components/App"

import State, {AppState} from './state'
import * as serialization from './serialization'

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
                    State.actions.replaceState(urlState)
                } else {
                }

                this.setState({loading: false})
            })
            .catch(error => {
                console.error(error);
                this.crash(error);
            });
    }

    handleStateChange = (state: AppState) => {
        serialization.setUrlState(state);
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
    }

    crash(msg: string) {
        this.setState({
            crashMsg: msg
        })
    }

    render() {
        if (this.state.crashMsg != null) {
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
