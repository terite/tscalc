import * as React from "react"

import * as game from "./game"

import {App} from "./components/App"

import {GameContext} from './context'
import State, {AppState} from './state'
import * as serialization from './serialization'

interface State {
    crashMsg?: string
    gameData: game.GameData|null
}

export class AppLoader extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props)

        this.state = {
            gameData: null
        }

        fetch("seablock.json")
            .then((response) => response.json())
            .then((raw: any) => {
                const gameData = new game.GameData(raw)

                const urlState = serialization.getUrlState(gameData)
                if (urlState) {
                    State.actions.replaceState(urlState)
                }

                this.setState({gameData})
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
        } else if (!this.state.gameData) {
            return (
                <State.Provider>
                    <h1>Loading...</h1>
                </State.Provider>
            )
        } else {
            const gameData = this.state.gameData
            return (
                <State.Provider>
                    <State.Consumer>{this.handleStateChange}</State.Consumer>
                    <GameContext.Provider value={gameData}>
                        <App />
                    </GameContext.Provider>
                </State.Provider>
            )
        }
    }
}
