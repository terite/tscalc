import * as React from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';

import { DropResult, DragDropContext, Droppable } from 'react-beautiful-dnd';

import * as signal from '../signal';
import * as game from '../game';
import { Rational } from '../rational';

import { RecipeRow } from './RecipeRow';
import { RecipePicker } from './RecipePicker';
import { TotalCard } from './TotalCard';

import { RecipeGroupData, RecipeRowData } from '../state';

import { AppActions, AppState, withBoth } from '../state';
import * as su from '../stateutil';

import styles from './RecipeGroup.module.css';

interface Props {
  group: RecipeGroupData;
  state: AppState;
  actions: AppActions;
}

class RawRecipeGroup extends React.Component<Props, {}> {
  componentDidMount() {
    signal.addRecipeRow.addHandler(this.handlePickRecipe);
  }

  componentWillUnmount() {
    signal.addRecipeRow.removeHandler(this.handlePickRecipe);
  }

  handlePickRecipe = (recipe: game.Recipe) => {
    this.props.actions.addRow({
      recipe: recipe,
      machine: su.getDefaultMachine(recipe, this.props.state),
      numMachines: Rational.one,
      modules: [],
      beaconModule: null,
      numBeacons: 0,
    });
  };

  handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    this.props.actions.moveRow(result.source.index, result.destination.index);
  };

  renderRow = (data: RecipeRowData, index: number) => {
    return <RecipeRow key={data.recipe.name} index={index} {...data} />;
  };

  handleClickRename = () => {
    const i = this.props.state.activeGroupIdx;
    const name = prompt(
      'Whatcha wanna call it now?',
      this.props.state.groups[i].name
    );
    if (name) {
      this.props.actions.renameGroup(i, name);
    }
  };

  handleClickDelete = () => {
    const i = this.props.state.activeGroupIdx;
    const group = this.props.state.groups[i];
    if (window.confirm(`Are you sure you want to delete ${group.name}`)) {
      this.props.actions.removeGroup(i);
    }
  };

  render() {
    const gd = this.props.state.gameData;
    const availableRecipes = gd.recipes.filter((recipe) => {
      return !this.props.group.rows.some((row) => row.recipe === recipe);
    });

    return (
      <div className={styles.RecipeGroup}>
        <div className="clearfix">
          <h3 className="float-left">{this.props.group.name}</h3>
          <div className="float-right">
            <Dropdown as={ButtonGroup} size="sm">
              <Button variant="info" onClick={this.handleClickRename}>
                Rename
              </Button>

              <Dropdown.Toggle split variant="info" id="button-split" />

              <Dropdown.Menu>
                <Dropdown.Item onClick={this.handleClickDelete}>
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
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
