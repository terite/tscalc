import * as React from "react"

import * as game from "./game"

import {RecipeGroup} from "./components/RecipeGroup"

import {GameContext} from './context'

interface State {
    crashMsg?: string
    gameData: game.GameData|null
}

export class App extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props)

        this.state = {
            gameData: null
        }

        fetch("seablock.json")
            .then((response) => response.json())
            .then((raw: any) => {
                this.setState({
                    gameData: new game.GameData(raw)
                })
            })
            .catch(error => {
                console.error(error);
                this.crash(error);
            });
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
            return <div>
                <h1>Crashed!</h1>
                <pre>{this.state.crashMsg}</pre>
            </div>
        } else if (!this.state.gameData) {
            return <h1>Loading...</h1>
        } else {
            return (
                <GameContext.Provider value={this.state.gameData}>
                    <div className="container">
                        <RecipeGroup gameData={this.state.gameData} />
                    </div>
                </GameContext.Provider>
            )
        }

    }
}
