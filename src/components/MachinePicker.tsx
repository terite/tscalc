import * as React from 'react'

import * as game from '../game'

import {Icon} from './Icon'

type Machine = game.Entity.AssemblingMachine

class MachineTooltip extends React.Component<{machine: Machine}, {}> {
    render() {
        return <div className="well">
            <b>{this.props.machine.niceName()}</b><br />
            <b>Crafting Speed:</b> {this.props.machine.data.crafting_speed}
        </div>
    }
}

interface MachinePickerProps {
    gameData: game.GameData
    machines: Machine[]
    selected: Machine 
    onChange(m: Machine): void
}

interface MachinePickerState {
    selected: Machine 
}

export class MachinePicker extends React.Component<MachinePickerProps, MachinePickerState> {

    constructor(props: MachinePickerProps) {
        super(props)
        this.state = {
            selected: this.props.selected
        }
    }

    render() {
        return <Icon
            obj={this.props.selected.data}
            gameData={this.props.gameData}
            tooltip={<MachineTooltip machine={this.props.selected} />}
            />
    }

}
