import * as React from "react"
import * as Fuse from "fuse.js"

import * as game from "../game"
import * as signal from "../signal"

import {RecipeCard} from './RecipeCard'

import debounce = require('lodash/debounce')

type Props = {
    recipes: game.Recipe[]
    onPickRecipe(r: game.Recipe): void
}

type State = {
    query: string,
    matches: game.Recipe[]
}


enum KeyTypes {
    NiceName = "NiceName",
    Name = "Name"
}

function getFn(recipe: game.Recipe, key: string) {
    switch (key as KeyTypes) {
        case KeyTypes.NiceName:
            return recipe.niceName()
        case KeyTypes.Name:
            return recipe.name;
    }
}

const RE_ADVANCED = /((?:produces)|(?:consumes)):([a-z0-9\-]+)/g

export class RecipePicker extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            query: "",
            matches: []
        }

        signal.ingredientClick.addHandler(this.handleIngredientClick)
        signal.productClick.addHandler(this.handleProductClick)
    }

    componentWillUnmount() {
        this.debCalculateMatches.cancel()
        signal.ingredientClick.removeHandler(this.handleIngredientClick)
        signal.productClick.removeHandler(this.handleProductClick)
    }

    public handleIngredientClick = (ingredient: game.Ingredient) => {
        const term = `produces:${ingredient.name}`;
        if (!this.state.query.includes(term)) {
            this.setQuery(`${this.state.query} ${term}`, () => {
                this.calculateMatches();
            });
        }
    }

    public handleProductClick = (product: game.Product) => {
        const term = `consumes:${product.name}`;
        if (!this.state.query.includes(term)) {
            this.setQuery(`${this.state.query} ${term}`, () => {
                this.calculateMatches();
            });
        }
    }

    public handleQueryInput = (event: React.FormEvent<HTMLInputElement>) => {
        let target = event.target as HTMLInputElement
        this.setQuery(target.value)
    }

    public handleRecipeClick = (recipe: game.Recipe) => {
        this.props.onPickRecipe(recipe)
        this.setQuery("")
    }

    public setQuery = (query: string, callback?: () => void) => {
        if (!query.trim()) {
            this.debCalculateMatches.cancel()
            this.setState({
                query: "",
                matches: []
            }, callback)
        } else {
            this.setState({query: query}, callback)
            this.debCalculateMatches()
        }
    }

    calculateMatches() {
        let query = this.state.query.trim().toLowerCase();
        if (!query) {
            this.setState({matches: []})
            return
        }

        const conditions = {
            consumes: [] as string[],
            produces: [] as string[]
        }

        type ckey = keyof typeof conditions

        query = query.replace(RE_ADVANCED, (_, key, value) => {
            conditions[key as ckey].push(value)
            return ""
        }).trim()

        let recipes = this.props.recipes;
        if (conditions.consumes.length || conditions.produces.length) {
            recipes = recipes.filter(recipe => {
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
                return true
            })
        }

        if (query) {
            const fuse = new Fuse(recipes, {
                shouldSort: true,
                getFn: getFn,
                keys: [{
                    name: KeyTypes.NiceName,
                    weight: 0.7
                }, {
                    name: KeyTypes.Name,
                    weight: 0.2
                }]
            });
            recipes = fuse.search<game.Recipe>(query);
        }

        this.setState({matches: recipes})
    }

    debCalculateMatches = debounce(this.calculateMatches.bind(this), 250)

    renderMatches() {
        return this.state.matches
             .slice(0, 10)
             .map((r) => <div key={r.name}>
                 <RecipeCard recipe={r} onClick={this.handleRecipeClick} />
             </div>)
    }

    render() {
        return (
            <div className="recipe-picker">
                <div>
                    <input className="editable-display form-control"
                        placeholder="Search for a recipe"
                        value={this.state.query}
                        onChange={this.handleQueryInput}
                    />
                </div>
                {this.renderMatches()}
            </div>
        )
    }

}
