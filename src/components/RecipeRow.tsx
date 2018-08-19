import * as React from "react";

import * as game from "../game"

import {Icon} from './Icon'
import {RecipeCard} from './RecipeCard'
import {MachinePicker} from './MachinePicker'
import {ModulePicker} from './ModulePicker'

import {clone} from '../util'
import {Totals} from '../totals'

type ChangeableProps = {
    recipe: game.Recipe
    machine: game.Entity.AssemblingMachine
    numMachines: number
    modules: Array<game.Module|null>
}

export type Props = {
    onRemove(r: game.Recipe): void
    onChange(r: Props): void
} & ChangeableProps

type State = {
    numTxt: string
}

export class RecipeRow extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            numTxt: props.numMachines.toString()
        }
    }

    public handleRemoveClick = () => {
        this.props.onRemove(this.props.recipe)
    }

    public handleMachineChange = (machine: game.Entity.AssemblingMachine) => {
        // TODO: condense modules w/ filter??
        this.applyChange({
            machine: machine,
            modules: this.props.modules.slice(0, machine.data.module_slots)
        })
    }

    public handleNumMachinesChange = (event: React.FormEvent<HTMLInputElement>) => {
        const value = (event.target as HTMLInputElement).value;
        this.setState({numTxt: value})
        if (!value.trim()) {
            return
        }
        const num = Number(value);
        if (!Number.isInteger(num)) {
            // TODO: error?
            return
        }
        if (Number.isInteger(num) && num >= 0) {
            this.applyChange({numMachines: num})
        }
    }

    public handleSetModule = (index: number, module: game.Module|null) => {
        const modules = this.props.modules.slice()
        modules[index] = module
        this.applyChange({modules: modules})
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
                onClick={() => this.handleMachineChange(machine)}
                />
        })
    }

    renderModules() {
        let numSlots = this.props.machine.data.module_slots

        let slots = []
        for (let i=0; i < numSlots; i++) {
            slots.push(this.props.modules[i] || null)
        }

        return slots.map((module, i) => {
            return <ModulePicker
                key={i}
                recipe={this.props.recipe}
                selected={module}
                onChange={(m) => this.handleSetModule(i, m)}
                />
        })
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
            <div className="recipe-row card">
                <div className="card-header">
                    <div style={{float: "left"}}>
                        <Icon
                            obj={recipe}
                            text={recipe.niceName()}
                            tooltip={<RecipeCard recipe={recipe} />}
                            />
                    </div>
                    <div style={{float: "right"}}>
                        <button type="button"
                            className="btn btn-danger"
                            onClick={this.handleRemoveClick}>Remove</button>
                    </div>
                    <div style={{clear: "both"}} />
                </div>
                <div className="card-body">
                    <input
                        value={this.state.numTxt}
                        onChange={this.handleNumMachinesChange}
                        type="number" min="0" step="1" />

                    {this.renderMachines()}

                    <hr />

                    <div>{this.renderModules()}</div>

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
