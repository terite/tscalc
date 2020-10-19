import * as React from 'react';

import type { Module, Recipe } from '../game';

import { Icon } from './Icon';
import { ModuleCard } from './ModuleCard';
import { Dropdown } from './generic';
import { useGameData } from '../atoms';

interface ModulePickerProps {
  recipe: Recipe;
  isBeacon?: boolean;
  selected: Module | null;
  onChange(m: Module | null): void;
}

export const ModulePicker: React.FC<ModulePickerProps> = (props) => {
  const gameData = useGameData();
  const renderSelected = (module: Module | null): React.ReactNode => {
    if (module) {
      return <Icon obj={module} tooltip={<ModuleCard module={module} />} />;
    } else {
      return <Icon obj={gameData.noModuleModule} />;
    }
  };

  const renderOption = (module: Module | null): React.ReactNode => {
    if (module) {
      return (
        <Icon
          obj={module}
          tooltip={<ModuleCard module={module} />}
          text={module.niceName}
        />
      );
    } else {
      return (
        <Icon
          obj={gameData.noModuleModule}
          text={gameData.noModuleModule.niceName}
        />
      );
    }
  };

  const options = gameData.modules
    .filter((m) => {
      // TODO: what is the actual logic for which modules are allowed in beacons?
      if (props.isBeacon && m.effects.productivity.isPositive()) {
        return false;
      }
      return m.canUseWith(props.recipe);
    })
    .map((m) => ({
      key: m.name,
      option: m as Module | null,
      active: m === props.selected,
    }));

  options.unshift({
    key: 'no_module',
    option: null,
    active: !props.selected,
  });

  return (
    <Dropdown
      options={options}
      selected={props.selected}
      onSelect={props.onChange}
      renderOption={renderOption}
      renderSelected={renderSelected}
    />
  );
};
