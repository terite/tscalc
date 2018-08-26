import { createDakpan } from 'dakpan';

import * as game from './game'


export interface RecipeRowData {
    recipe: game.Recipe
    machine: game.Entity.AssemblingMachine
    numMachines: number
    modules: Array<game.Module|null>
    beaconModule: game.Module|null,
    numBeacons: number
}


export interface AppState {
    rows: RecipeRowData[]
}

export const defaultState: AppState = {
    rows: []
}

const State = createDakpan(defaultState)({
    replaceState: (newState: AppState) => () => newState,

    addRow: (row: RecipeRowData) => (state) => ({
        rows: state.rows.concat([row])
    }),

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
    }
});

export const withState = State.withConsumer((state) => ({state}))
export const withActions = State.withConsumer((_, actions) => ({actions}))
export const withBoth = State.withConsumer((state, actions) => ({state, actions}))

export default State;
