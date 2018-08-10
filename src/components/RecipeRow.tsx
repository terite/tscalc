import * as React from "react";

import * as game from "../game"

import {Icon} from './Icon'
import {RecipeCell} from './RecipeCell'
import {MachinePicker} from './MachinePicker'

import {clone} from '../util'
import {Totals} from '../totals'

type ChangeableProps = {
    recipe: game.Recipe
    machine: game.Entity.AssemblingMachine
    numMachines: number
    // modules: game.Entity.Module[]
}

export type Props = {
    gameData: game.GameData
    onRemove(r: game.Recipe): void
    onChange(r: Props): void
} & ChangeableProps

type State = {}

export class RecipeRow extends React.Component<Props, State> {

    public handleRemoveClick = () => {
        this.props.onRemove(this.props.recipe)
    }

    public handleMachineChange = (machine: game.Entity.AssemblingMachine) => {
        this.applyChange({machine: machine})
    }

    public handleNumMachinesChange = (event: React.FormEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        const num = Number(target.value);
        if (!Number.isInteger(num)) {
            // TODO: error?
            return
        }
        if (Number.isInteger(num) && num >= 0) {
            this.applyChange({numMachines: num})
        }
    }

    applyChange(changes: Partial<ChangeableProps>) {
        let newprops = Object.assign(clone(this.props), changes)
        this.props.onChange(newprops)
    }

    getOutput() {
        let t = new Totals()
        t.addRow(this.props)
        return {
            ingredients: t.ingredients,
            products: t.products
        }
    }

    renderMachines() {
        return <MachinePicker
            machines={this.props.recipe.madeIn}
            selected={this.props.machine}
            onChange={this.handleMachineChange}
            />
        return this.props.recipe.madeIn.map((machine) => {
            let style = (machine == this.props.machine) ? {border: "1px solid red"} : {}

            let text = `${machine.niceName()}\nCrafting Speed: ${machine.data.crafting_speed}`
            return <Icon
                style={style}
                key={machine.data.name}
                obj={machine.data}
                title={text} 
                onClick={this.handleMachineChange.bind(this, machine)}
                />
        })
    }

    renderRecipeIcon() {
        return <Icon
            obj={this.props.recipe}
            tooltip={<RecipeCell 
                recipe={this.props.recipe}
                gameData={this.props.gameData} />}
            />
    }

    render() {
        let recipe = this.props.recipe
        let output = this.getOutput()

        let ingredients = output.ingredients.map((ingredient, i) =>
            <Icon
                key={i}
                obj={ingredient.item}
                text={ingredient.niceName()} />
        )
        let products = output.products.map((product, i) =>
            <Icon
                key={i}
                obj={product.item}
                text={product.niceName()} />
        )
        return (
            <div className="recipe-row">
                <div className="recipe-cell">
                    <div style={{lineHeight: "32px"}}>
                        {this.renderRecipeIcon()}
                        {recipe.niceName()} × <input
                            value={this.props.numMachines}
                            onChange={this.handleNumMachinesChange}
                            type="number" min="0" step="1" />

                        {this.renderMachines()}

                        <div style={{float: "right"}}>
                            <Icon
                                obj={recipe}
                                title="Remove recipe"
                                onClick={this.handleRemoveClick} />
                        </div>
                    </div>
                    <hr />

                    <div style={{display: "inline-block", float: "left"}}>
                        Ingredients:
                        {ingredients}
                    </div>

                    <div style={{display: "inline-block"}}>
                        Products:
                        {products}
                    </div>
                    <div style={{clear: "both"}} />
                </div>
            </div>
        )
    }

}
