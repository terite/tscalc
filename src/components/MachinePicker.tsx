import React from 'react';

import { AssemblingMachine } from '../game';

import { Icon } from './Icon';
import { MachineCard } from './MachineCard';
import { Dropdown } from './generic';

interface MachinePickerProps {
  machines: AssemblingMachine[];
  selected: AssemblingMachine;
  onChange(m: AssemblingMachine): void;
}

const renderSelected = (machine: AssemblingMachine): React.ReactNode => {
  return (
    <Icon obj={machine} tooltip={() => <MachineCard machine={machine} />} />
  );
};

const renderOption = (machine: AssemblingMachine): React.ReactNode => {
  return (
    <Icon
      obj={machine}
      tooltip={() => <MachineCard machine={machine} />}
      text={machine.niceName}
    />
  );
};

export const MachinePicker: React.FC<MachinePickerProps> = (props) => {
  const options = props.machines.map((machine) => ({
    key: machine.name,
    option: machine,
    active: machine === props.selected,
  }));

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
