import { h, Component } from "preact";

import * as game from "../game"
// import {Totals} from '../totals'

import {Icon} from './Icon'

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

export class RecipeRow extends Component<Props, State> {

    public handleRemoveClick = () => {
        this.props.onRemove(this.props.recipe)
    }

    public handleMachineChange = () => {
    }

    public handleNumMachinesChange = (event: Event) => {
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

    render() {
        let recipe = this.props.recipe
        let output = this.getOutput()

        let ingredients = output.ingredients.map((ingredient) =>
            <Icon
                obj={ingredient.item}
                gameData={this.props.gameData}
                text={ingredient.niceName()} />
        )
        let products = output.products.map((product) =>
            <Icon
                obj={product.item}
                gameData={this.props.gameData}
                text={product.niceName()} />
        )
        return (
            <div className="recipe-row">
                <div className="recipe-cell">
                    <div style="line-height: 32px">
                        <Icon
                            obj={recipe}
                            gameData={this.props.gameData} />
                        {recipe.niceName()} × <input
                            value={this.props.numMachines}
                            onInput={this.handleNumMachinesChange}
                            type="number" min="0" step="1" />
                        <Icon
                            obj={this.props.machine.data}
                            gameData={this.props.gameData}
                            title={this.props.machine.niceName()}/>

                        <div style="float:right">
                            <Icon
                                obj={recipe}
                                gameData={this.props.gameData}
                                title="Remove recipe"
                                onClick={this.handleRemoveClick} />
                        </div>
                    </div>
                    <hr />

                    <div style="display: inline-block">
                        Ingredients:
                        {ingredients}
                    </div>

                    <div style="display: inline-block">
                        Products:
                        {products}
                    </div>
                </div>
            </div>
        )
    }

}
