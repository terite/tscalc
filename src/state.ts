import { createDakpan } from 'dakpan';

import * as game from './game'
import {getDefaultMachine} from './stateutil'


export interface RecipeRowData {
    recipe: game.Recipe
    machine: game.Entity.AssemblingMachine
    numMachines: number
    modules: Array<game.Module|null>
    beaconModule: game.Module|null,
    numBeacons: number
}

export interface AppSettingsData {
    assemblerOverrides: {
        [category: string]: game.Entity.AssemblingMachine
    }
}

export interface AppState {
    gameData: game.GameData
    rows: RecipeRowData[]
    settings: AppSettingsData
}

export const defaultState: AppState = {
    gameData: {} as game.GameData,  // set early by apploader
    rows: [],
    settings: {
        assemblerOverrides: {}
    }
}

const State = createDakpan(defaultState)({
    replaceState: (newState: Partial<AppState>) => () => newState,

    addRow: (row: RecipeRowData) => (state) => {
        // ignore adding duplicate rows
        if (state.rows.some(r => r.recipe.name == row.recipe.name)) {
            return {}
        }

        return {rows: state.rows.concat([row])};
    },

    updateRow: (i: number, updates: Partial<RecipeRowData>) => (state) => {
        const rows = Array.from(state.rows)
        rows[i] = {...state.rows[i], ...updates}
        return {
            rows: rows
        }
    },

    removeRow: (i: number) => (state) => {
        const rows = Array.from(state.rows)
        rows.splice(i, 1)
        return {
            rows: rows
        }
    },

    updateDefaultMachine: (category, newMachine) => (state) => {
        const oldMachine = getDefaultMachine(category, state)

        const rows = state.rows.map((row) => {
            if (row.recipe.category != category ||
                row.machine != oldMachine) {
                return row
            }
            return {
                ... row,
                machine: newMachine
            }
        })


        return {
            rows: rows,
            settings: {
                ... state.settings,
                assemblerOverrides: {
                    ... state.settings.assemblerOverrides,
                    [category]: newMachine
                }
            }
        }
    }
});

export const withState = State.withConsumer((state) => ({state}))
export const withActions = State.withConsumer((_, actions) => ({actions}))
export const withBoth = State.withConsumer((state, actions) => ({state, actions}))
export const withGame = State.withConsumer((state) => ({gameData: state.gameData}))

export default State;
