import React, { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import * as game from '../game';

import { settingsAtom, useGameData } from '../atoms';
import { AppSettingsData } from '../state';
import { getDefaultMachine } from '../stateutil';

import { MachinePicker } from './MachinePicker';

export const Settings: React.FC<{}> = () => {
  const gameData = useGameData();
  const [settings, setSettings] = useRecoilState(settingsAtom);

  const handleSetDefaultMachine = useCallback(
    (category: string, machine: game.AssemblingMachine) => {
      setSettings((settings) => ({
        ...settings,
        assemblerOverrides: {
          ...settings.assemblerOverrides,
          [category]: machine,
        },
      }));
    },
    [setSettings]
  );

  const categoryNames = Object.entries(gameData.categoryMap)
    .filter((entry) => entry[1].length > 1)
    .map((entry) => entry[0]);

  categoryNames.sort((a, b) => a.localeCompare(b));

  return (
    <div>
      <h3>Default Assemblers</h3>
      {categoryNames.map((name) => (
        <CategoryRow
          gameData={gameData}
          settings={settings}
          key={name}
          category={name}
          onSetDefaultMachine={handleSetDefaultMachine}
        />
      ))}
    </div>
  );
};

interface CategoryRowProps {
  category: string;
  gameData: game.GameData;
  settings: AppSettingsData;
  onSetDefaultMachine(category: string, machine: game.AssemblingMachine): void;
}

class CategoryRow extends React.PureComponent<CategoryRowProps, never> {
  handleChange = (machine: game.AssemblingMachine): void => {
    this.props.onSetDefaultMachine(this.props.category, machine);
  };

  render(): React.ReactNode {
    const machines = this.props.gameData.categoryMap[this.props.category];
    const selected = getDefaultMachine(
      this.props.category,
      this.props.settings,
      this.props.gameData
    );
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
