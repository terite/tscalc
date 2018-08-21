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
        return <div>
            <span>Beacons:</span>
            <input
                value={this.state.numBeaconsTxt}
                onChange={this.handleNumBeaconsChange}
                type="number" min="0" step="1" />

            <ModulePicker
                isBeacon={true}
                recipe={this.props.recipe}
                selected={this.props.beaconModule}
                onChange={this.handleSetBeaconModule}
                />
        </div>
    }

    render() {
        let recipe = this.props.recipe
        let output = this.getOutput()

        let ingredients = output.ingredients.map((ingredient, i) =>
            <Icon
                key={i}
                tooltip={<IngredientCard obj={ingredient} />}
                obj={ingredient.item}
                text={`${ingredient.amount.toString()} / sec`} />
        )
        let products = output.products.map((product, i) =>
            <Icon
                key={i}
                tooltip={<IngredientCard obj={product} />}
                obj={product.item}
                text={`${product.amount.toString()} / sec`} />
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
                            className="btn btn-cancel"
                            onClick={this.handleRemoveClick}>Remove</button>
                    </div>
                    <div style={{clear: "both"}} />
                </div>
                <div className="card-body">
                    <input
                        value={this.state.numMachinesTxt}
                        onChange={this.handleNumMachinesChange}
                        type="number" min="0" step="1" />

                    {this.renderMachines()}

                    <hr />

                    <div>{this.renderModules()}</div>
                    <div>{this.renderBeacons()}</div>

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
