import * as React from "react"

import * as game from "../game"
import {Totals} from "../totals"

import {Icon} from './Icon'
import {RecipeRow, Props as RecipeRowProps} from './RecipeRow'
import {RecipePicker} from './RecipePicker'


type Props = {
    gameData: game.GameData
}

type State = {
    rows: RecipeRowProps[]
}

type SerializedRow = [
    string, string, number
]

export class RecipeGroup extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {
            rows: []
        }
    }

    componentDidMount() {
        if (document.location.hash.startsWith('#[')) {
            let hash = decodeURIComponent(document.location.hash.substr(1))
            let d = JSON.parse(hash)
            this.deserialize(d)
        }
    }

    componentDidUpdate() {
        history.replaceState('', '', `#${JSON.stringify(this.serialize())}`)
    }

    serialize(): SerializedRow[] {
        return this.state.rows.map((row):SerializedRow => [
            row.recipe.name,
            row.machine.data.name,
            row.numMachines
        ])
    }

    deserialize(state: SerializedRow[]): void {
        let gd = this.props.gameData

        this.addRows(state.map(([recipe, machine, numMachines]) => ({
            recipe: gd.recipeMap[recipe],
            machine: gd.entityMap[machine],
            numMachines
        })))
    }

    public handlePickRecipe = (recipe: game.Recipe) => {
        this.addRows([{
            recipe: recipe,
            machine: recipe.madeIn[0],
            numMachines: 1
        }])
    }

    addRows(rows: {recipe: game.Recipe, machine: game.Entity.AssemblingMachine, numMachines: number}[]) {
        let newRows = rows.map((r) => ({
            gameData: this.props.gameData,
            onRemove: this.removeRow.bind(this, r.recipe),
            onChange: this.changeRow.bind(this),

            recipe: r.recipe,
            machine: r.machine,
            numMachines: r.numMachines,
        }))
        this.setState({rows: this.state.rows.concat(newRows)})
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
        return <RecipeRow key={row.recipe.name} {...row} />
    }

    private renderTotals(totals: Totals) {
        let reduced = totals.reduce()
        return (
        <>
            <div className="well" style={{display: "inline-block", float: "left"}}>
                Ingredients:
                {reduced.ingredients.map((ing, i) => (
                    <Icon key={i} gameData={this.props.gameData} obj={ing.item} text={ing.niceName()} />
                ))}
            </div>
            <div className="well" style={{display: "inline-block"}}>
                Products:
                {reduced.products.map((prod, i) => (
                    <Icon key={i} gameData={this.props.gameData} obj={prod.item} text={prod.niceName()} />
                ))}
            </div>
            <div style={{clear: "both"}}></div>
        </>)
    }

    render() {
        let availableRecipes = this.props.gameData.recipes.filter((recipe) => {
            return !this.state.rows.some(row => row.recipe == recipe)
        })

        let totals = new Totals()
        for (let row of this.state.rows) {
            totals.addRow(row)
        }

        return (
        <div>
            <h3>Add recipe picker</h3>
            <RecipePicker
                recipes={availableRecipes}
                gameData={this.props.gameData}
                onPickRecipe={this.handlePickRecipe} />
            <hr />
            {this.state.rows.map(this.renderRow)}
            <hr />
            {this.renderTotals(totals)}
        </div>
        )
    }
}
