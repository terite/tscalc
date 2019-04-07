import * as React from 'react';
import * as game from '../game';

interface Props {
    machine: game.AssemblingMachine;
}

export const MachineCard = (props: Props) => {
    return (
        <div className="machine-card card">
            <div className="card-body">
                <b>{props.machine.niceName()}</b>
                <br />
                <b>Crafting Speed:</b> {props.machine.data.crafting_speed}
                <br />
                <b>Module Slots:</b> {props.machine.data.module_slots}
            </div>
        </div>
    );
};
