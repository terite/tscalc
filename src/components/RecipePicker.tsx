import * as React from "react"
import * as Fuse from "fuse.js"
import debounce = require('lodash/debounce')

import * as game from "../game"
import * as signal from "../signal"

// import {RecipeCard} from './RecipeCard'
import {Icon} from './Icon'



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

type Props = {
    recipes: game.Recipe[]
    onPickRecipe(r: game.Recipe): void
}

type State = {
    query: string,
    matches: game.Recipe[]
}

export class RecipePicker extends React.PureComponent<Props, State> {

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
            recipes = fuse.search(query);
        }
        this.setState({matches: recipes})
    }

    debCalculateMatches = debounce(this.calculateMatches.bind(this), 200)

    renderMatches() {
        if (!this.state.matches.length) {
            return ""
        }
		let matches = this.state.matches;
		if (matches.length > 100) {
			matches = matches.slice(0, 100)
		}
        return (
            <table>
            <thead>
                <tr>
                    <th>Recipe</th>
                    <th>Time</th>
                    <th>Ingredients</th>
                    <th>Products</th>
                </tr>
            </thead>
            <tbody>
                {matches.map(r => <RecipeMatch recipe={r} key={r.name} />)}
            </tbody>
            </table>

        )
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

interface RecipeMatchProps {
    recipe: game.Recipe
}

function card(body: React.ReactNode) {
    return (
        <div className="card">
            <div className="card-body">{body}</div>
        </div>
    )
}

class RecipeMatch extends React.PureComponent<RecipeMatchProps, {}> {

    ingredients: JSX.Element[]
    products: JSX.Element[]

    constructor(props: RecipeMatchProps) {
        super(props);

        const recipe = this.props.recipe;

        this.ingredients = recipe.ingredients.map((ing, i) => (
            <Icon key={i} obj={ing.item} tooltip={card(ing.niceName())} />
        ))
        this.products = recipe.products.map((prod, i) => (
            <Icon key={i} obj={prod.item} tooltip={card(prod.niceName())} />
        ))
    }

    render() {
        const recipe = this.props.recipe;
        return (
            <tr>
                <td className="result-name"><Icon obj={recipe} title={recipe.niceName()}/>{recipe.niceName()}</td>
                <td>{recipe.crafting_time.toString()}</td>
                <td>{this.ingredients}</td>
                <td>{this.products}</td>
            </tr>
        )

    }
}
