import { h, Component } from "preact";

import * as game from "../game"
import {Totals} from "../totals"

import {RecipeRow, Props as RecipeRowProps} from './RecipeRow'
import {RecipePicker} from './RecipePicker'


type Props = {
    gameData: game.GameData
}

type State = {
    rows: RecipeRowProps[]
}

export class RecipeGroup extends Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {
            rows: []
        }
    }

    public handlePickRecipe = (recipe: game.Recipe) => {
        this.addRow(recipe)
    }

    addRow(recipe: game.Recipe) {
        let row = {
            gameData: this.props.gameData,
            onRemove: this.removeRow.bind(this, recipe),
            onChange: this.changeRow.bind(this),

            recipe: recipe,
            machine: recipe.madeIn[0],
            numMachines: 1,
        }
        this.setState({rows: this.state.rows.concat([row])})
    }

    changeRow(newRow: RecipeRowProps) {
        this.setState({rows: this.state.rows.map((oldRow) => {
            return oldRow.recipe == newRow.recipe ? newRow : oldRow
        })})
    }

    removeRow(recipe: game.Recipe) {
        this.setState({rows: this.state.rows.filter((row) => {
            return row.recipe != recipe
        })})
    }

    renderRow(row: RecipeRowProps) {
        return <RecipeRow {...row} />
    }

    render() {
        let availableRecipes = this.props.gameData.recipes.filter((recipe) => {
            return !this.state.rows.some(row => row.recipe == recipe)
        })

        let totals = new Totals()
        for (let row of this.state.rows) {
            totals.addRow(row)
        }
        let reduced = totals.reduce()

        return (
        <div>
            <h3>Add recipe picker</h3>
            <RecipePicker
                recipes={availableRecipes}
                gameData={this.props.gameData}
                onPickRecipe={this.handlePickRecipe} />
            <hr />
            <div>Have {this.state.rows.length} row(s)</div>
            {this.state.rows.map(this.renderRow)}
            <hr />
            Ingredients:
            <ul>
            {reduced.ingredients.map(i => <li>{i.niceName()}</li>)}
            </ul>
            Products:
            <ul>
            {reduced.products.map(p => <li>{p.niceName()}</li>)}
            </ul>

        </div>
        )
    }
}
