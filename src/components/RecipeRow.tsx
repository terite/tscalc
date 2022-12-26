import React from 'react';
import { useRecoilValue } from 'recoil';
import { Draggable } from 'react-beautiful-dnd';

import * as game from '../game';
import { Rational } from '../rational';
import { calculateRates, Totals } from '../totals';
import { RecipeRowData } from '../state';
import { recipeTargetAtom, RecipeTarget } from '../atoms';

import { Icon } from './Icon';
import { RecipePart } from './RecipePart';
import { RecipeCard } from './RecipeCard';
import { MachinePicker } from './MachinePicker';
import { ModulePicker } from './ModulePicker';
import { IntegerInput, RationalInput } from './generic';

import styles from './RecipeRow.module.css';

interface Props {
  index: number;
  recipeTarget: RecipeTarget | undefined;
  data: RecipeRowData;

  onUpdateRow(row: RecipeRowData): void;
  onRemoveRow(recipe: game.Recipe): void;
}

class RawRecipeRow extends React.PureComponent<Props, never> {
  handleRemoveRow = (): void => {
    this.props.onRemoveRow(this.props.data.recipe);
  };

  handleMachineChange = (machine: game.AssemblingMachine): void => {
    this.applyChange({
      machine: machine,
      modules: this.props.data.modules
        .filter((module) => module !== null)
        .slice(0, machine.moduleSlots),
    });
  };

  handleNumMachinesChange = (num: Rational): void => {
    this.applyChange({ numMachines: num });
  };

  handleNumBeaconsChange = (num: number): void => {
    this.applyChange({ numBeacons: num });
  };

  handleSetAllModules = (): void => {
    this.applyChange({
      modules: new Array(this.props.data.machine.moduleSlots).fill(
        this.props.data.modules[0]
      ),
    });
  };

  handleSetModule = (index: number, module: game.Module | null): void => {
    const modules = this.props.data.modules.slice();
    modules[index] = module;
    this.applyChange({ modules: modules });
  };

  handleSetBeaconModule = (module: game.Module | null): void => {
    this.applyChange({ beaconModule: module });
  };

  handleClickAmount(thing: game.Ingredient | game.Product): void {
    const newTargetStr = window.prompt(`Set new target`, thing.amount.toString());
    if (newTargetStr == null)
      return;
    const newTarget = Rational.fromString(newTargetStr);
    const targetRatio = newTarget.div(thing.amount);
    const newNumMachines = this.props.data.numMachines.mul(targetRatio);
    this.applyChange({
      numMachines: newNumMachines,
    });
  }

  handleInputGroupClick: React.MouseEventHandler<any> = (event): void => {
    const { recipeTarget } = this.props;
    if (!event.shiftKey || !recipeTarget) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    const output = new Totals();
    output.addRow({
      ...this.props.data,
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

  applyChange(change: Partial<RecipeRowData>): void {
    this.props.onUpdateRow({
      ...this.props.data,
      ...change,
    });
  }

  renderModules(): React.ReactNode {
    const numSlots = this.props.data.machine.moduleSlots;

    const slots = [];
    for (let i = 0; i < numSlots; i++) {
      const module = this.props.data.modules[i] || null;
      slots.push(
        <ModulePicker
          key={i}
          recipe={this.props.data.recipe}
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

    if (slots.length > 0) {
      return (
        <div className="mb-3 btn-group btn-icon-wrapper" role="group">
          {slots}
        </div>
      );
    } else {
      return undefined;
    }
  }

  renderBeacons(): React.ReactNode {
    return (
      <div className="btn-toolbar">
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">Beacon Modules</span>
          </div>
          <IntegerInput
            value={this.props.data.numBeacons}
            onChange={this.handleNumBeaconsChange}
            min={0}
          />
          <div className="input-group-append btn-icon-wrapper">
            <ModulePicker
              isBeacon={true}
              recipe={this.props.data.recipe}
              selected={this.props.data.beaconModule}
              onChange={this.handleSetBeaconModule}
            />
          </div>
        </div>
      </div>
    );
  }

  renderMachines(): React.ReactNode {
    return (
      <div className="btn-toolbar mb-3">
        <div className="input-group" onClick={this.handleInputGroupClick}>
          <RationalInput
            value={this.props.data.numMachines}
            onChange={this.handleNumMachinesChange}
            positiveOnly={true}
          />
          <div className="input-group-append btn-icon-wrapper">
            <MachinePicker
              machines={this.props.data.recipe.madeIn}
              selected={this.props.data.machine}
              onChange={this.handleMachineChange}
            />
          </div>
        </div>
      </div>
    );
  }

  render(): React.ReactNode {
    const recipe = this.props.data.recipe;
    const [rowIngredients, rowProducts] = calculateRates(this.props.data);

    const ingredients = rowIngredients.map((ingredient) => (
      <div className="mb-1" key={ingredient.name}>
        <RecipePart obj={ingredient} onClickAmount={this.handleClickAmount.bind(this, ingredient)} />
      </div>
    ));
    const products = rowProducts.map((product) => (
      <div className="mb-1" key={product.name}>
        <RecipePart obj={product} onClickAmount={this.handleClickAmount.bind(this, product)} />
      </div>
    ));
    return (
      <Draggable draggableId={recipe.name} index={this.props.index}>
        {(provided) => (
          <div
            className={`${styles.RecipeRow} recipe-row card mb-3`}
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <div className="card-header clearfix" {...provided.dragHandleProps}>
              <div className="float-left">
                <Icon
                  obj={recipe}
                  text={recipe.niceName}
                  tooltip={() => <RecipeCard recipe={recipe} />}
                />
              </div>
              <div className="float-right">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={this.handleRemoveRow}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="card-body clearfix">
              <div className="float-left">
                {this.renderMachines()}
                {this.renderModules()}
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

export const RecipeRow: React.FC<{
  index: number;
  data: RecipeRowData;
  onUpdateRow(data: RecipeRowData): void;
  onRemoveRow(recipe: game.Recipe): void;
}> = ({ index, data, onRemoveRow, onUpdateRow }) => {
  const recipeTarget = useRecoilValue(recipeTargetAtom);

  return (
    <RawRecipeRow
      index={index}
      data={data}
      recipeTarget={recipeTarget}
      onUpdateRow={onUpdateRow}
      onRemoveRow={onRemoveRow}
    />
  );
};
