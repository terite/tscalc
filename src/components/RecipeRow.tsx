import * as React from "react";

import * as game from "../game";
import { Rational } from "../rational";

import { Icon } from "./Icon";
import { RecipeCard } from "./RecipeCard";
import { MachinePicker } from "./MachinePicker";
import { ModulePicker } from "./ModulePicker";
import { IntegerInput, RationalInput } from "./generic";

// import {clone} from '../util'
import { Totals } from "../totals";
import State, { RecipeRowData } from "../state";

import * as signal from "../signal";

interface Props extends RecipeRowData {
    index: number;
    actions: typeof State.actions;
}

type IngredientCardProps = {
    obj: game.Ingredient | game.Product;
};

const IngredientCard = (props: IngredientCardProps) => (
    <div className="card">
        <div className="card-header">
            {props.obj.item.niceName()} ({props.obj.name})
        </div>
    </div>
);

export class RecipeRow extends React.Component<Props, {}> {
    public handleRemoveClick = () => {
        this.props.actions.removeRow(this.props.index);
    };

    public handleMachineChange = (machine: game.Entity.AssemblingMachine) => {
        // TODO: condense modules w/ filter??
        this.applyChange({
            machine: machine,
            modules: this.props.modules.slice(0, machine.data.module_slots),
        });
    };

    public handleNumMachinesChange = (num: Rational) => {
        this.applyChange({ numMachines: num });
    };

    public handleNumBeaconsChange = (num: number) => {
        this.applyChange({ numBeacons: num });
    };

    public handleSetAllModules = () => {
        this.applyChange({
            modules: new Array(this.props.machine.data.module_slots).fill(
                this.props.modules[0]
            ),
        });
    };

    public handleSetModule = (index: number, module: game.Module | null) => {
        const modules = this.props.modules.slice();
        modules[index] = module;
        this.applyChange({ modules: modules });
    };

    public handleSetBeaconModule = (module: game.Module | null) => {
        this.applyChange({ beaconModule: module });
    };

    public handleIngredientClick = (ingredient: game.Ingredient) => {
        if (ingredient.item.madeBy.length == 1) {
            signal.addRecipeRow.dispatch(ingredient.item.madeBy[0]);
        } else {
            signal.addIngredientFilter.dispatch(ingredient);
        }
    };

    public handleProductClick = (product: game.Product) => {
        if (product.item.usedBy.length == 1) {
            signal.addRecipeRow.dispatch(product.item.usedBy[0]);
        } else {
            signal.addProductFilter.dispatch(product);
        }
    };

    applyChange(change: Partial<RecipeRowData>) {
        this.props.actions.updateRow(this.props.index, change);
    }

    getOutput() {
        const t = new Totals();
        t.addRow(this.props);
        return {
            ingredients: t.ingredients,
            products: t.products,
        };
    }

    renderModules() {
        const numSlots = this.props.machine.data.module_slots;

        const slots = [];
        for (let i = 0; i < numSlots; i++) {
            const module = this.props.modules[i];
            slots.push(
                <ModulePicker
                    key={i}
                    recipe={this.props.recipe}
                    selected={module}
                    onChange={m => this.handleSetModule(i, m)}
                />
            );
        }

        if (numSlots > 1) {
            slots.splice(
                1,
                0,
                <button
                    onClick={this.handleSetAllModules}
                    key="applicator"
                    className="btn"
                >
                    →
                </button>
            );
        }

        return slots;
    }

    renderBeacons() {
        return (
            <div className="btn-toolbar mb-3">
                <div className="input-group">
                    <div className="input-group-prepend">
                        <div className="input-group-text">Beacon Modules</div>
                    </div>
                    <IntegerInput
                        value={this.props.numBeacons}
                        onChange={this.handleNumBeaconsChange}
                        positiveOnly={true}
                        intOnly={true}
                    />
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
        );
    }

    renderMachines() {
        return (
            <div className="btn-toolbar mb-3">
                <div className="input-group">
                    <RationalInput
                        value={this.props.numMachines}
                        onChange={this.handleNumMachinesChange}
                        positiveOnly={true}
                    />
                    <div className="input-group-append btn-icon-wrapper">
                        <MachinePicker
                            machines={this.props.recipe.madeIn}
                            selected={this.props.machine}
                            onChange={this.handleMachineChange}
                        />
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const recipe = this.props.recipe;
        const output = this.getOutput();

        const ingredients = output.ingredients.map((ingredient, i) => (
            <div className="mb-1" key={i}>
                <Icon
                    onClick={this.handleIngredientClick.bind(null, ingredient)}
                    tooltip={<IngredientCard obj={ingredient} />}
                    obj={ingredient.item}
                    text={`${ingredient.amount.toDecimal()} / sec`}
                />
            </div>
        ));
        const products = output.products.map((product, i) => (
            <div className="mb-1" key={i}>
                <Icon
                    onClick={this.handleProductClick.bind(null, product)}
                    tooltip={<IngredientCard obj={product} />}
                    obj={product.item}
                    text={`${product.amount.toDecimal()} / sec`}
                />
            </div>
        ));
        return (
            <div className="recipe-row card mb-3">
                <div className="card-header">
                    <div style={{ float: "left" }}>
                        <Icon
                            obj={recipe}
                            text={recipe.niceName()}
                            tooltip={<RecipeCard recipe={recipe} />}
                        />
                    </div>
                    <div style={{ float: "right" }}>
                        <button
                            type="button"
                            className="btn btn-cancel"
                            onClick={this.handleRemoveClick}
                        >
                            Remove
                        </button>
                    </div>
                    <div style={{ clear: "both" }} />
                </div>
                <div className="card-body">
                    <div style={{ float: "left" }}>
                        {this.renderMachines()}
                        <div className="mb-3 btn-group btn-icon-wrapper">
                            {this.renderModules()}
                        </div>
                        {this.renderBeacons()}
                    </div>

                    <div style={{ float: "right" }}>
                        <div
                            className="mr-3"
                            style={{
                                display: "inline-block",
                                float: "left",
                                minWidth: "150px",
                            }}
                        >
                            <b>Ingredients:</b>
                            {ingredients}
                        </div>

                        <div
                            className="mr-2"
                            style={{
                                display: "inline-block",
                                minWidth: "150px",
                            }}
                        >
                            <b>Products:</b>
                            {products}
                        </div>
                    </div>
                    <div style={{ clear: "both" }} />
                </div>
            </div>
        );
    }
}
