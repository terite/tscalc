import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { DropResult, DragDropContext, Droppable } from 'react-beautiful-dnd';

import * as signal from '../signal';
import * as game from '../game';
import * as su from '../stateutil';
import { Rational } from '../rational';
import { settingsAtom, useGameData, GroupAtom } from '../atoms';
import { assert } from '../util';
import { useGroupAdd } from '../actions';
import { RecipeGroupData, RecipeRowData } from '../state';

import { RecipeRow } from './RecipeRow';
import { RecipePicker } from './RecipePicker';
import { TotalCard } from './TotalCard';

import styles from './RecipeGroup.module.css';

interface Props {
  group: RecipeGroupData;
  gameData: game.GameData;

  onRenameGroup(newName: string): void;
  onCloneGroup(newName: string): void;
  onRemoveGroup(): void;

  onAddRow(recipe: game.Recipe): void;
  onMoveRow(oldIndex: number, newIndex: number): void;
  onUpdateRow(data: RecipeRowData): void;
  onRemoveRow(recipe: game.Recipe): void;
}

class RawRecipeGroup extends React.PureComponent<Props, never> {
  componentDidMount(): void {
    signal.addRecipeRow.addHandler(this.props.onAddRow);
  }

  componentDidUpdate(oldProps: Props, oldState: never): void {
    if (this.props.onAddRow !== oldProps.onAddRow) {
      signal.addRecipeRow.removeHandler(oldProps.onAddRow);
      signal.addRecipeRow.addHandler(this.props.onAddRow);
    }
  }

  componentWillUnmount(): void {
    signal.addRecipeRow.removeHandler(this.props.onAddRow);
  }

  handleDragEnd = (result: DropResult): void => {
    if (!result.destination) {
      return;
    }
    if (result.source.index !== result.destination.index) {
      this.props.onMoveRow(result.source.index, result.destination.index);
    }
  };

  renderRow = (data: RecipeRowData, index: number): React.ReactNode => {
    return (
      <RecipeRow
        key={data.recipe.name}
        index={index}
        data={data}
        onUpdateRow={this.props.onUpdateRow}
        onRemoveRow={this.props.onRemoveRow}
      />
    );
  };

  handleClickRename = (): void => {
    const name = prompt('Whatcha wanna call it now?', this.props.group.name);
    if (name) {
      this.props.onRenameGroup(name);
    }
  };

  handleClickClone = (): void => {
    const name = prompt(
      'Whatcha wanna call it now?',
      `${this.props.group.name} (Clone)`
    );
    if (name) {
      this.props.onCloneGroup(name);
    }
  };

  handleClickDelete = (): void => {
    if (this.props.group.rows.length) {
      if (
        !window.confirm(
          `Are you sure you want to delete ${this.props.group.name}`
        )
      ) {
        return;
      }
    }
    this.props.onRemoveGroup();
  };

  renderHeader(): React.ReactNode {
    return <div className="row align-items-end">
      <div className="col">
        <h3 className="mb-0">🏭 {this.props.group.name}</h3>
      </div>
      <div className="col text-right">
        <div className="btn-group btn-group-sm">
          <button className="btn btn-primary" onClick={this.handleClickRename}>
            Rename
              </button>
          <button className="btn btn-primary" onClick={this.handleClickClone}>
            Clone
              </button>
          <button
            className="btn btn-danger"
            onClick={this.handleClickDelete}
          >
            Delete
              </button>
        </div>
      </div>
    </div>
  }

  render(): React.ReactNode {
    const gd = this.props.gameData;
    const availableRecipes = gd.recipes.filter((recipe) => {
      return !this.props.group.rows.some((row) => row.recipe === recipe);
    });

    return (
      <div className={styles.RecipeGroup}>
        {this.renderHeader()}

        <hr />

        <RecipePicker
          className="mb-3"
          recipes={availableRecipes}
          onPickRecipe={this.props.onAddRow}
        />

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

interface RecipeGroupProps {
  groupAtom: GroupAtom;
  onRemoveGroup(groupAtom: GroupAtom): void;
}
export const RecipeGroup: React.FC<RecipeGroupProps> = ({
  groupAtom,
  onRemoveGroup,
}) => {
  const [group, setGroup] = useRecoilState(groupAtom);
  const settings = useRecoilValue(settingsAtom);
  const gameData = useGameData();
  const addGroup = useGroupAdd();

  const handleRenameGroup = useCallback(
    (newName: string) => {
      setGroup((oldGroup) => ({
        ...oldGroup,
        name: newName,
      }));
    },
    [setGroup]
  );

  const handleCloneGroup = useCallback(
    (newName: string) => {
      addGroup({
        ...group,
        name: newName,
      });
    },
    [addGroup, group]
  );

  const handleRemoveGroup = useCallback(() => {
    onRemoveGroup(groupAtom);
  }, [onRemoveGroup, groupAtom]);

  const handleMoveRow = useCallback(
    (oldIndex: number, newIndex: number) => {
      const rows = Array.from(group.rows);
      const [removed] = rows.splice(oldIndex, 1);
      assert(removed, `Nothing at old index: ${oldIndex}`);
      rows.splice(newIndex, 0, removed);

      setGroup((oldGroup) => ({
        ...oldGroup,
        rows,
      }));
    },
    [group, setGroup]
  );

  const handleAddRow = useCallback(
    (recipe: game.Recipe) => {
      setGroup((group) => {
        // only allow one instance of a recipe per group
        if (group.rows.find((row) => row.recipe.name === recipe.name)) {
          return group;
        }

        return {
          ...group,
          rows: [
            ...group.rows,
            {
              recipe: recipe,
              machine: su.getDefaultMachine(recipe, settings, gameData),
              numMachines: Rational.one,
              modules: [],
              beaconModule: null,
              numBeacons: 0,
            },
          ],
        };
      });
    },
    [settings, gameData, setGroup]
  );

  const handleUpdateRow = useCallback(
    (data: RecipeRowData) => {
      setGroup((group) => ({
        ...group,
        rows: group.rows.map((r) => (r.recipe === data.recipe ? data : r)),
      }));
    },
    [setGroup]
  );

  const handleRemoveRow = useCallback(
    (recipe: game.Recipe) => {
      setGroup((group) => ({
        ...group,
        rows: group.rows.filter((r) => r.recipe !== recipe),
      }));
    },
    [setGroup]
  );

  return (
    <RawRecipeGroup
      group={group}
      gameData={gameData}
      onRenameGroup={handleRenameGroup}
      onCloneGroup={handleCloneGroup}
      onRemoveGroup={handleRemoveGroup}
      onAddRow={handleAddRow}
      onMoveRow={handleMoveRow}
      onUpdateRow={handleUpdateRow}
      onRemoveRow={handleRemoveRow}
    />
  );
};
