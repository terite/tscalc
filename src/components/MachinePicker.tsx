import * as React from 'react';

import * as game from '../game';

import { Icon } from './Icon';
import { MachineCard } from './MachineCard';
import { Dropdown } from './generic';

type Machine = game.Entity.AssemblingMachine;

interface MachinePickerProps {
    machines: Machine[];
    selected: Machine;
    onChange(m: Machine): void;
}

const renderSelected = (machine: Machine) => {
    return (
        <Icon obj={machine.data} tooltip={<MachineCard machine={machine} />} />
    );
};

const renderOption = (machine: Machine) => {
    return (
        <Icon
            obj={machine.data}
            tooltip={<MachineCard machine={machine} />}
            text={machine.niceName()}
        />
    );
};

export const MachinePicker = (props: MachinePickerProps) => {
    const options = props.machines.map((machine) => ({
        key: machine.data.name,
        option: machine,
        active: machine == props.selected,
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
