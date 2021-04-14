import React, { useCallback, useMemo } from 'react';
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

  const categoryNames: string[] = useMemo(() => {
    const names = Object.entries(gameData.categoryMap)
      .filter((entry) => entry[1].length > 1)
      .map((entry) => entry[0]);

    names.sort((a, b) => a.localeCompare(b));
    return names;
  }, [gameData]);

  return (
    <div className="container">
      <div className="row">
        <div className="col">
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
        <div className="col">
          <h3>Active mods</h3>
          <SettingsActiveMods gameData={gameData} />
        </div>
      </div>
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
    const machines = this.props.gameData.categoryMap[this.props.category] || [];
    const selected = getDefaultMachine(
      this.props.category,
      this.props.settings,
      this.props.gameData
    );
    return (
      <div className="btn-toolbar mb-3">
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

const MOD_INFO: Record<string, string> = {
  base: 'Data for the base "factorio" game',
  'factorio-data-dumper':
    'A fake mod that exports data about other installed mods.',
};

const SettingsActiveMods: React.FC<{ gameData: game.GameData }> = ({
  gameData,
}) => {
  const children: React.ReactNode[] = [];
  for (const [name, version] of Object.entries(gameData.activeMods)) {
    const url = 'https://mods.factorio.com/mod/' + name;
    let nameNode: React.ReactNode;
    if (MOD_INFO[name] !== undefined) {
      nameNode = (
        <>
          <b>{name}</b>
          <span title={MOD_INFO[name]}> 🛈</span>
        </>
      );
    } else {
      nameNode = (
        <a href={url} target="_blank" rel="noopener noreferrer">
          <b>{name}</b>
        </a>
      );
    }
    children.push(
      <li key={name}>
        {nameNode} &ndash; version {version}
      </li>
    );
  }
  return <ul>{children}</ul>;
};
