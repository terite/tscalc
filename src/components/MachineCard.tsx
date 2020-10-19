import * as React from 'react';
import * as game from '../game';

interface Props {
  machine: game.AssemblingMachine;
}

export const MachineCard: React.FC<Props> = (props) => {
  return (
    <div className="machine-card card">
      <div className="card-body">
        <b>{props.machine.niceName}</b>
        <br />
        <b>Crafting Speed:</b> {props.machine.craftingSpeed}
        <br />
        <b>Module Slots:</b> {props.machine.moduleSlots}
      </div>
    </div>
  );
};
