import * as React from "react"

import * as game from "../game"

import {RecipeCard} from './RecipeCard'

type Props = {
    recipes: game.Recipe[]
    onPickRecipe(r: game.Recipe): void
}

type State = {
    query: string
    focused: boolean
}

const RE_ADVANCED = /((?:produces)|(?:consumes)):([a-z\-]+)/g

export class RecipePicker extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            query: "",
            focused: false
        }
    }

    public handleQueryInput = (event: React.FormEvent<HTMLInputElement>) => {
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

    matcher = () => {
        let query = this.state.query.trim().toLowerCase()
        if (!query) {
            return () => false
        }

        let conditions = {
            consumes: [] as string[],
            produces: [] as string[]
        }

        type ckey = keyof typeof conditions

        query = query.replace(RE_ADVANCED, (_, key, value) => {
            conditions[key as ckey].push(value)
            return ""
        }).trim()

        return (recipe: game.Recipe) => {
            for (let name of conditions.consumes) {
                if (!recipe.ingredients.some(i => i.name == name)) {
                    return false
                }
            }
            for (let name of conditions.produces) {
                if (!recipe.products.some(i => i.name == name)) {
                    return false
                }
            }

            return (
                recipe.niceName().toLowerCase().includes(query) ||
                recipe.name.toLowerCase().includes(query))
        }
    }

    render() {
        let matches = this.props.recipes
            .filter(this.matcher())
            .slice(0, 10)
            .map((r) => <div key={r.name} onClick={() => this.handleRecipeClick(r)}>
                <RecipeCard recipe={r} onClick={this.handleRecipeClick} />
            </div>)

        return (
        <div className="recipe-picker">
            <div>
            <input className="editable-display"
                value={this.state.query}
                onChange={this.handleQueryInput}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
            />
            </div>
            {matches}
        </div>
        )
    }

}
