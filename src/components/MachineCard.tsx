import * as React from 'react';
import * as game from '../game';

type Machine = game.Entity.AssemblingMachine;

export const MachineCard = (props: { machine: Machine }) => {
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
