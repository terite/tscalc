import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import Button from 'react-bootstrap/Button';

import * as game from '../game';
import { Rational } from '../rational';

import { Icon } from './Icon';
import { RecipeOutput } from './RecipeOutput';
import { RecipeCard } from './RecipeCard';
import { MachinePicker } from './MachinePicker';
import { ModulePicker } from './ModulePicker';
import { IntegerInput, RationalInput } from './generic';

import { Totals } from '../totals';
import { withBoth, RecipeRowData, AppActions, AppState } from '../state';

interface Props extends RecipeRowData {
  index: number;
  actions: AppActions;
  state: AppState;
}

class RawRecipeRow extends React.PureComponent<Props, never> {
  handleRemoveClick = () => {
    this.props.actions.removeRow(this.props.index);
  };

  handleMachineChange = (machine: game.AssemblingMachine) => {
    this.applyChange({
      machine: machine,
      modules: this.props.modules
        .filter((module) => module !== null)
        .slice(0, machine.data.module_slots),
    });
  };

  handleNumMachinesChange = (num: Rational) => {
    this.applyChange({ numMachines: num });
  };

  handleNumBeaconsChange = (num: number) => {
    this.applyChange({ numBeacons: num });
  };

  handleSetAllModules = () => {
    this.applyChange({
      modules: new Array(this.props.machine.data.module_slots).fill(
        this.props.modules[0]
      ),
    });
  };

  handleSetModule = (index: number, module: game.Module | null) => {
    const modules = this.props.modules.slice();
    modules[index] = module;
    this.applyChange({ modules: modules });
  };

  handleSetBeaconModule = (module: game.Module | null) => {
    this.applyChange({ beaconModule: module });
  };

  handleInputGroupClick: React.MouseEventHandler<any> = (event) => {
    const { recipeTarget } = this.props.state;
    if (!event.shiftKey || !recipeTarget) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const output = new Totals();
    output.addRow({
      ...this.props,
      numMachines: Rational.one,
    });

    let current: game.Ingredient | game.Product | undefined;
    current = output.ingredients.find((x) => {
      return x.item.name === recipeTarget.item.name;
    });

    current =
      current ||
      output.products.find((x) => {
        return x.item.name === recipeTarget.item.name;
      });

    if (!current) {
      console.error(
        `Could not find ${recipeTarget.item.name} in totals`,
        output
      );
      return;
    }

    const newNum = recipeTarget.amount.div(current.amount);

    this.applyChange({
      numMachines: newNum,
    });
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
          onChange={(m) => this.handleSetModule(i, m)}
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
      <div className="btn-toolbar">
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">Beacon Modules</span>
          </div>
          <IntegerInput
            value={this.props.numBeacons}
            onChange={this.handleNumBeaconsChange}
            min={0}
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
        <div className="input-group" onClick={this.handleInputGroupClick}>
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
        <RecipeOutput obj={ingredient} />
      </div>
    ));
    const products = output.products.map((product, i) => (
      <div className="mb-1" key={i}>
        <RecipeOutput obj={product} />
      </div>
    ));
    return (
      <Draggable draggableId={recipe.name} index={this.props.index}>
        {(provided) => (
          <div
            className="recipe-row card mb-3"
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <div className="card-header clearfix" {...provided.dragHandleProps}>
              <div className="float-left">
                <Icon
                  obj={recipe}
                  text={recipe.niceName()}
                  tooltip={<RecipeCard recipe={recipe} />}
                />
              </div>
              <div className="float-right">
                <Button
                  variant="danger"
                  onClick={this.handleRemoveClick}
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            </div>
            <div className="card-body clearfix">
              <div className="float-left">
                {this.renderMachines()}
                <div className="mb-3 btn-group btn-icon-wrapper">
                  {this.renderModules()}
                </div>
                {this.renderBeacons()}
              </div>

              <div className="float-right">
                <div
                  className="mr-3"
                  style={{
                    display: 'inline-block',
                    float: 'left',
                    minWidth: '150px',
                  }}
                >
                  <b>Ingredients:</b>
                  {ingredients}
                </div>

                <div
                  className="mr-2"
                  style={{
                    display: 'inline-block',
                    minWidth: '150px',
                  }}
                >
                  <b>Products:</b>
                  {products}
                </div>
              </div>
            </div>
          </div>
        )}
      </Draggable>
    );
  }
}

export const RecipeRow = withBoth(RawRecipeRow);
