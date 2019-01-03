import * as React from "react"

import * as game from "../game"

import State, {AppState, withGame, withBoth} from '../state'
import {getDefaultMachine} from '../stateutil'


import {MachinePicker} from './MachinePicker'

interface RawSettingsProps {
    gameData: game.GameData
}

class RawSettings extends React.Component<RawSettingsProps, {}> {

    render() {
        return (
            <div>
                <h3>Default Assemblers</h3>
                {Object.keys(this.props.gameData.categoryMap).map(cat => (
                    <CategoryRow key={cat} category={cat} />
                ))}
            </div>
        );
    }
}

interface CategoryRowProps {
    category: string
    state: AppState
    actions: typeof State.actions
}

class RawCategoryRow extends React.Component<CategoryRowProps, {}> {
    handleChange = (machine: game.Entity.AssemblingMachine) => {
        this.props.actions.updateDefaultMachine(this.props.category, machine)
    }

    render() {
        const machines = this.props.state.gameData.categoryMap[this.props.category]
        const selected = getDefaultMachine(this.props.category, this.props.state)
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

const CategoryRow = withBoth(RawCategoryRow);

export const Settings = withGame(RawSettings);