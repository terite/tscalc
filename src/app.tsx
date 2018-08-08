import * as React from "react"

import * as game from "./game"

import {RecipeGroup} from "./components/RecipeGroup"

interface State {
    crashMsg?: string
    group: JSX.Element | null
}

export class App extends React.Component<{}, State> {

    constructor(props: {}) {
        super(props)

        this.state = {
            group: null
        }

        fetch("seablock.json")
            .then((response) => response.json())
            .then((raw: any) => {
                this.setState({
                    group: <RecipeGroup gameData={new game.GameData(raw)} />
                });
            })
            .catch(error => {
                console.error(error);
                this.crash(error);
            });
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
                <span>{this.state.crashMsg}</span>
            </div>
        } else if (!this.state.group) {
            return <h1>Loading...</h1>
        } else {
            return (
            <div>
                {this.state.group}
            </div>
            )
        }

    }
}
