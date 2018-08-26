import * as React from "react"

import * as game from "../game"
import {Totals} from "../totals"

import {Icon} from './Icon'
import {RecipeRow} from './RecipeRow'
import {RecipePicker} from './RecipePicker'

import {RecipeRowData} from '../state'

import State, {AppState, withBoth} from '../state'
import {withGame} from '../context'


type Props = {
    gameData: game.GameData,
    rows: RecipeRowData[],
    state: AppState
    actions: typeof State.actions
}

class RawRecipeGroup extends React.Component<Props, {}> {

    public handlePickRecipe = (recipe: game.Recipe) => {
        this.props.actions.addRow({
            recipe: recipe,
            machine: recipe.madeIn[recipe.madeIn.length - 1],
            numMachines: 1,
            modules: [],
            beaconModule: null,
            numBeacons: 0,
        })
    }

    renderRow = (data: RecipeRowData, index: number) => {
        return <RecipeRow
            key={data.recipe.name}
            index={index}
            actions={this.props.actions}
            {...data} />
    }

    private renderTotals(totals: Totals) {
        let reduced = totals.reduce()
        return (
            <div className="card combined-totals">
                <div className="card-header">Combined Totals</div>
                <div className="card-body">
                    <div className="container">
                        <div className="row">
                            <div className="col">
                                Ingredients:
                                {reduced.ingredients.map((ing, i) => (
                                    <Icon key={i} obj={ing.item} text={ing.niceName()} />
                                ))}
                            </div>
                            <div className="col">
                                Products:
                                {reduced.products.map((prod, i) => (
                                    <Icon key={i} obj={prod.item} text={prod.niceName()} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        let availableRecipes = this.props.gameData.recipes.filter((recipe) => {
            return !this.props.rows.some(row => row.recipe == recipe)
        })

        let totals = new Totals()
        for (let row of this.props.rows) {
            totals.addRow(row)
        }

        return (
        <div className="recipe-group">
            <h3>Add recipe picker</h3>
            <RecipePicker
                recipes={availableRecipes}
                onPickRecipe={this.handlePickRecipe} />
            <hr />
            {this.props.rows.map(this.renderRow)}
            <hr />
            {this.renderTotals(totals)}
        </div>
        )
    }
}

export const RecipeGroup = withGame(withBoth(RawRecipeGroup))
