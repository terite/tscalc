import * as React from "react"

import * as game from "../game"

import {RecipeRow} from './RecipeRow'
import {RecipePicker} from './RecipePicker'
import {TotalCard} from './TotalCard'

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


    render() {
        const availableRecipes = this.props.gameData.recipes.filter((recipe) => {
            return !this.props.rows.some(row => row.recipe == recipe)
        })

        return (
        <div className="recipe-group">
            <h3>Add recipe picker</h3>
            <RecipePicker
                recipes={availableRecipes}
                onPickRecipe={this.handlePickRecipe} />
            <hr />
            {this.props.rows.map(this.renderRow)}
            <hr />
            <TotalCard rows={this.props.rows} />
        </div>
        )
    }
}

export const RecipeGroup = withGame(withBoth(RawRecipeGroup))
