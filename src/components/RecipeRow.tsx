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

    beaconModule: game.Module|null,
    numBeacons: number

}

export type Props = {
    onRemove(r: game.Recipe): void
    onChange(r: Props): void
} & ChangeableProps

type State = {
    numMachinesTxt: string
    numBeaconsTxt: string
}

type IngredientCardProps = {
    obj: game.Ingredient | game.Product
}

const IngredientCard = (props: IngredientCardProps) => (
    <div className="card">
        <div className="card-header">
            {props.obj.item.niceName()} ({props.obj.name})
        </div>
    </div>
)

export class RecipeRow extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            numMachinesTxt: props.numMachines.toString(),
            numBeaconsTxt: props.numBeacons.toString()
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
        this.setState({numMachinesTxt: value})
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

    public handleNumBeaconsChange = (event: React.FormEvent<HTMLInputElement>) => {
        const value = (event.target as HTMLInputElement).value;
        this.setState({numBeaconsTxt: value})
        if (!value.trim()) {
            return
        }
        const num = Number(value);
        if (!Number.isInteger(num)) {
            // TODO: error?
            return
        }
        if (Number.isInteger(num) && num >= 0) {
            this.applyChange({numBeacons: num})
        }
    }

    public handleSetAllModules = () => {
        this.applyChange({
            modules: (new Array(this.props.machine.data.module_slots)).fill(this.props.modules[0])
        })
    }

    public handleSetModule = (index: number, module: game.Module|null) => {
        const modules = this.props.modules.slice()
        modules[index] = module
        this.applyChange({modules: modules})
    }

    public handleSetBeaconModule = (module: game.Module|null) => {
        this.applyChange({beaconModule: module})
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

    renderModules() {
        let numSlots = this.props.machine.data.module_slots

        let slots = []
        for (let i=0; i < numSlots; i++) {
            let module = this.props.modules[i];
            slots.push(
                <ModulePicker
                    key={i}
                    recipe={this.props.recipe}
                    selected={module}
                    onChange={(m) => this.handleSetModule(i, m)}
                    />
            )
        }

        if (numSlots > 1) {
            slots.splice(1, 0,
                <button
                    onClick={this.handleSetAllModules}
                    key="applicator"
                    className="btn">→</button>)
        }

        return slots
    }

    renderBeacons() {
        return (
            <div className="btn-toolbar mb-3">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <div className="input-group-text">Beacon Modules</div>
                    </div>
                    <input
                        className="form-control"
                        value={this.state.numBeaconsTxt}
                        onChange={this.handleNumBeaconsChange}
                        type="number" min="0" step="1" />
                    <div className="input-group-append btn-icon-wrapper">
                        <ModulePicker
                            isBeacon={true}
                            recipe={this.props.recipe}
                            selected={this.props.beaconModule}
                            onChange={this.handleSetBeaconModule}
                            />
                    </div>
                </div>
            </div>
        )
    }

    renderMachines() {
        return (
            <div className="btn-toolbar mb-3">
                <div className="input-group">
                    <input
                        className="form-control"
                        value={this.state.numMachinesTxt}
                        onChange={this.handleNumMachinesChange}
                        type="number" min="0" step="1" />
                    <div className="input-group-append btn-icon-wrapper">
                        <MachinePicker
                            machines={this.props.recipe.madeIn}
                            selected={this.props.machine}
                            onChange={this.handleMachineChange}
                            />
                    </div>
                </div>
            </div>
        )
    }

    render() {
        let recipe = this.props.recipe
        let output = this.getOutput()

        let ingredients = output.ingredients.map((ingredient, i) =>
            <div className="mb-1" key={i}>
                <Icon
                    tooltip={<IngredientCard obj={ingredient} />}
                    obj={ingredient.item}
                    text={`${ingredient.amount.toString()} / sec`} />
            </div>
        )
        let products = output.products.map((product, i) =>
            <div className="mb-1" key={i}>
                <Icon
                    key={i}
                    tooltip={<IngredientCard obj={product} />}
                    obj={product.item}
                    text={`${product.amount.toString()} / sec`} />
            </div>
        )
        return (
            <div className="recipe-row card mb-3">
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
                            className="btn btn-cancel"
                            onClick={this.handleRemoveClick}>Remove</button>
                    </div>
                    <div style={{clear: "both"}} />
                </div>
                <div className="card-body">
                    <div style={{float: "left"}}>
                        {this.renderMachines()}
                        <div className="mb-3 btn-group btn-icon-wrapper">
                            {this.renderModules()}
                        </div>
                        {this.renderBeacons()}
                    </div>

                    <div style={{float: "right"}}>
                        <div className="mr-3" style={{display: "inline-block", float: "left", minWidth: "150px"}}>
                            <b>Ingredients:</b>
                            {ingredients}
                        </div>

                        <div className="mr-2" style={{display: "inline-block", minWidth: "150px"}}>
                            <b>Products:</b>
                            {products}
                        </div>
                    </div>
                    <div style={{clear: "both"}} />
                </div>
            </div>
        )
    }
}
