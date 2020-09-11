import * as React from 'react';

import * as game from '../game';

import { AppActions, AppState, withGame, withBoth } from '../state';
import { getDefaultMachine } from '../stateutil';

import { MachinePicker } from './MachinePicker';

interface RawSettingsProps {
  gameData: game.GameData;
}

class RawSettings extends React.PureComponent<RawSettingsProps, never> {
  render(): React.ReactNode {
    const categoryNames = Object.entries(this.props.gameData.categoryMap)
      .filter((entry) => entry[1].length > 1)
      .map((entry) => entry[0]);

    categoryNames.sort((a, b) => a.localeCompare(b));

    return (
      <div>
        <h3>Default Assemblers</h3>
        {categoryNames.map((name) => (
          <CategoryRow key={name} category={name} />
        ))}
      </div>
    );
  }
}

interface CategoryRowProps {
  category: string;
  state: AppState;
  actions: AppActions;
}

class RawCategoryRow extends React.PureComponent<CategoryRowProps, never> {
  handleChange = (machine: game.AssemblingMachine): void => {
    this.props.actions.updateDefaultMachine(this.props.category, machine);
  };

  render(): React.ReactNode {
    const machines = this.props.state.gameData.categoryMap[this.props.category];
    const selected = getDefaultMachine(this.props.category, this.props.state);
    return (
      <div className="btn-toolbar mb-3" key={this.props.category}>
        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text">{this.props.category}</span>
          </div>
          <div className="input-group-append btn-icon-wrapper">
            <MachinePicker
              machines={machines}
              selected={selected}
              onChange={this.handleChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

const CategoryRow = withBoth(RawCategoryRow);

export const Settings = withGame(RawSettings);
