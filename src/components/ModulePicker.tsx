import * as React from 'react';

import { GameData, Module, Recipe } from '../game';

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

let _nomodule: Module | undefined;
function getNoMod(gameData: GameData): Module {
  // TODO: cache based on gameData
  const icon = gameData.raw.sprites.extra.slot_icon_module;
  if (!_nomodule) {
    _nomodule = new Module({
      type: 'module',
      name: 'no_module',
      localised_name: { en: 'No Module' },
      category: 'speed',
      effect: {},
      limitation: [],
      rocket_launch_products: [],

      icon_row: icon.icon_row,
      icon_col: icon.icon_col,

      group: '',
      subgroup: '',
      order: '',
    });
  }

  return _nomodule;
}

export const ModulePicker: React.FC<ModulePickerProps> = (props) => {
  const gameData = useGameData();
  const nomod = getNoMod(gameData);
  const renderSelected = (module: Module | null): React.ReactNode => {
    if (module) {
      return <Icon obj={module} tooltip={<ModuleCard module={module} />} />;
    } else {
      return <Icon obj={nomod} />;
    }
  };

  const renderOption = (module: Module | null): React.ReactNode => {
    if (module) {
      return (
        <Icon
          obj={module}
          tooltip={<ModuleCard module={module} />}
          text={module.niceName()}
        />
      );
    } else {
      return <Icon obj={nomod} text={nomod.niceName()} />;
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
