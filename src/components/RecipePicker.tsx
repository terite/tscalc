import { h, Component } from "preact";

import * as game from "../game"

import {RecipeCell} from './RecipeCell'

type Props = {
    gameData: game.GameData
    recipes: game.Recipe[]
    onPickRecipe(r: game.Recipe): void
}

type State = {
    query: string
    focused: boolean
}

export class RecipePicker extends Component<Props, State> {

    public handleQueryInput = (event: Event) => {
        let target = event.target as HTMLInputElement
        this.setState({query: target.value})
    }

    public handleRecipeClick = (recipe: game.Recipe) => {
        this.props.onPickRecipe(recipe)
        this.setState({query: ""})
    }

    public handleFocus = () => {
        this.setState({focused: true})
    }
    public handleBlur = () => {
        // delay 100ms to let click events register
        setTimeout(() => {
            this.setState({focused: false})
        }, 100)
    }

    render() {
        let query = (this.state.query || "").toLowerCase()
        let matches = this.props.recipes
            .filter((recipe) => {
                if (query || this.state.focused) {
                    return (
                        recipe.niceName().toLowerCase().includes(query) ||
                        recipe.name.toLowerCase().includes(query))
                }
                return false
            })
            .slice(0, 10)
            .map((r) => <RecipeCell
                recipe={r}
                gameData={this.props.gameData}
                onClick={this.handleRecipeClick}/>)

        return (
        <div>
            <input
                value={this.state.query}
                onInput={this.handleQueryInput}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
            />
            {matches}
        </div>
        )
    }

}
