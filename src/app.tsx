import * as React from "react";

import * as game from "./game"

interface AppState {
    data?: game.GameData
    crashMsg?: string,
    hiddenRecipes: Set<string>
}


import {HoverableIcon} from "./components/HoverableIcon"


export class App extends React.Component<{}, AppState> {

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

    hideRecipe(recipeName: string) {
        // debugger
        // alert("hiding recipe " +  recipeName)
        // return;
        let s = new Set(this.state.hiddenRecipes)
        s.add(recipeName)
        this.setState({hiddenRecipes: s});
        console.log("Now hiding recipes", s)
    }

    formatItems(items: game.Item[]) {
        const ret = []
        for (let item of items) {
            let shown = false
            for (let recipe of item.madeBy) {
                if (this.state.hiddenRecipes.has(recipe.name)) {
                    continue
                }
                if (!shown) {
                    ret.push(<span key={item.name}>{item.niceName()}: </span>)
                    shown = true
                }
                ret.push(<HoverableIcon
                    key={item.name + recipe.name}
                    obj={recipe}
                    onClick={this.hideRecipe.bind(this, recipe.name)} />)
            }
            if (shown) {
                ret.push(<hr />)
            }
        }
        return ret
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
                <h1>Loaded {this.state.data.items.length} items</h1>
                <hr />
                {this.formatItems(this.state.data.items)}
            </div>
            )
        }

    }
}
