import { h, Component } from "preact";

import * as game from "./game"

interface AppState {
    data?: game.GameData
    crashMsg?: string,
    hiddenRecipes: Set<string>
}


// import {HoverableIcon} from "./components/HoverableIcon"
import {RecipeRow} from "./components/RecipeRow"


export class App extends Component<{}, AppState> {

    constructor(props: {}) {
        super(props)
        this.state = {
            hiddenRecipes: new Set()
        }

        fetch("data.json")
            .then((response) => response.json())
            .then((json: any) => {
                this.setState({
                    data: new game.GameData(json)
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

    formatRecipes(recipes: game.Recipe[]) {
        return recipes
            .filter((r) => r.products.length > 1)
            .map((r) => <RecipeRow recipe={r} key={r.name} gameData={this.state.data!}/>)
    }

    render() {
        if (this.state.crashMsg != null) {
            console.log("rendering crash")
            return <div>
                <h1>Crashed!</h1>
                <span>{this.state.crashMsg}</span>
            </div>
        } else if (!this.state.data) {
            console.log("rendering loading")
            return <h1>Loading...</h1>
        } else {
            console.log("rendering items")
            return (
            <div>
                {this.formatRecipes(this.state.data.recipes)}
            </div>
            )
        }

    }
}
