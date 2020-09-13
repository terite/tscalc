import * as React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { DropResult, DragDropContext, Droppable } from 'react-beautiful-dnd';

import * as signal from '../signal';
import * as game from '../game';
import * as su from '../stateutil';
import { Rational } from '../rational';

import { RecipeRow } from './RecipeRow';
import { RecipePicker } from './RecipePicker';
import { TotalCard } from './TotalCard';

import {
  AppActions,
  AppState,
  RecipeGroupData,
  RecipeRowData,
  withBoth,
} from '../state';

import styles from './RecipeGroup.module.css';

interface Props {
  group: RecipeGroupData;
  gameData: game.GameData;
  state: AppState;
  actions: AppActions;
}

class RawRecipeGroup extends React.PureComponent<Props, never> {
  componentDidMount(): void {
    signal.addRecipeRow.addHandler(this.handlePickRecipe);
  }

  componentWillUnmount(): void {
    signal.addRecipeRow.removeHandler(this.handlePickRecipe);
  }

  handlePickRecipe = (recipe: game.Recipe): void => {
    this.props.actions.addRow({
      recipe: recipe,
      machine: su.getDefaultMachine(
        recipe,
        this.props.state,
        this.props.gameData
      ),
      numMachines: Rational.one,
      modules: [],
      beaconModule: null,
      numBeacons: 0,
    });
  };

  handleDragEnd = (result: DropResult): void => {
    if (!result.destination) {
      return;
    }
    this.props.actions.moveRow(result.source.index, result.destination.index);
  };

  renderRow = (data: RecipeRowData, index: number): React.ReactNode => {
    return (
      <RecipeRow
        key={data.recipe.name}
        index={index}
        actions={this.props.actions}
        data={data}
      />
    );
  };

  handleClickRename = (): void => {
    const i = this.props.state.activeGroupIdx;
    const name = prompt(
      'Whatcha wanna call it now?',
      this.props.state.groups[i].name
    );
    if (name) {
      this.props.actions.renameGroup(i, name);
    }
  };

  handleClickClone = (): void => {
    const i = this.props.state.activeGroupIdx;
    const group = this.props.state.groups[i];
    const name = prompt('Whats this new thing called?', group.name);
    if (name) {
      this.props.actions.addGroup(name, group.rows);
    }
  };

  handleClickDelete = (): void => {
    const i = this.props.state.activeGroupIdx;
    const group = this.props.state.groups[i];

    if (group.rows.length) {
      if (!window.confirm(`Are you sure you want to delete ${group.name}`)) {
        return;
      }
    }
    this.props.actions.removeGroup(i);
  };

  render(): React.ReactNode {
    const gd = this.props.gameData;
    const availableRecipes = gd.recipes.filter((recipe) => {
      return !this.props.group.rows.some((row) => row.recipe === recipe);
    });

    return (
      <div className={styles.RecipeGroup}>
        <div className="clearfix">
          <h3 className="float-left">{this.props.group.name}</h3>
          <div className="float-right">
            <ButtonGroup>
              <Button variant="info" onClick={this.handleClickRename}>
                Rename
              </Button>
              <Button variant="info" onClick={this.handleClickClone}>
                Clone
              </Button>
              <Button variant="danger" onClick={this.handleClickDelete}>
                Delete
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <RecipePicker
          recipes={availableRecipes}
          onPickRecipe={this.handlePickRecipe}
        />
        <hr />

        <DragDropContext onDragEnd={this.handleDragEnd}>
          <Droppable droppableId={'eyy'}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {this.props.group.rows.map(this.renderRow)}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <hr />
        <TotalCard rows={this.props.group.rows} />
      </div>
    );
  }
}

export const RecipeGroup = withBoth(RawRecipeGroup);
