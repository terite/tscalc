import { createDakpan } from 'dakpan';

import * as game from './game'
import {getDefaultMachine} from './stateutil'


export interface RecipeRowData {
    recipe: game.Recipe;
    machine: game.Entity.AssemblingMachine;
    numMachines: number;
    modules: (game.Module|null)[];
    beaconModule: game.Module|null;
    numBeacons: number;
}

export interface RecipeGroupData {
    name: string;
    rows: RecipeRowData[];
}

export interface AppSettingsData {
    assemblerOverrides: {
        [category: string]: game.Entity.AssemblingMachine
    };
}

export interface AppState {
    gameData: game.GameData;
    groups: RecipeGroupData[];
    activeGroupIdx: number;
    settings: AppSettingsData;
}

export const defaultState: AppState = {
    gameData: {} as game.GameData,  // set early by apploader
    groups: [{
        name: 'Factory 1',
        rows: [],
    }],
    activeGroupIdx: 0,
    settings: {
        assemblerOverrides: {}
    }
}

function getActiveGroup(state: AppState) {
    return state.groups[state.activeGroupIdx];
};


function updateGroup(state: AppState, newGroup: Partial<RecipeGroupData>) {
    // TOOD: this can't work, right?
    const groups = state.groups.map((oldGroup, index) => {
        return index === state.activeGroupIdx
            ? { ...oldGroup, ...newGroup }
            : oldGroup;
    });

    return { groups };
}

const State = createDakpan(defaultState)({
    replaceState: (newState: Partial<AppState>) => () => newState,

    addRow: (row: RecipeRowData) => (state) => {
        const group = getActiveGroup(state);
        // ignore adding duplicate rows
        if (group.rows.some(r => r.recipe.name == row.recipe.name)) {
            return {}
        }

        return updateGroup(state, {rows: group.rows.concat([row])});
    },

    updateRow: (i: number, updates: Partial<RecipeRowData>) => (state) => {
        const group = getActiveGroup(state);
        const rows = Array.from(group.rows)
        rows[i] = {...group.rows[i], ...updates}
        return updateGroup(state, {
            rows: rows
        });
    },

    removeRow: (i: number) => (state) => {
        const group = getActiveGroup(state);
        const rows = Array.from(group.rows);
        rows.splice(i, 1);
        return updateGroup(state, {
            rows: rows
        });
    },

    updateDefaultMachine: (category, newMachine) => (state) => {
        const oldMachine = getDefaultMachine(category, state);

        const groups = state.groups.map((group) => {
            const rows = group.rows.map((row) => {
                if (row.recipe.category != category || row.machine != oldMachine) {
                    return row;
                }
                return {
                    ...row,
                    machine: newMachine
                }
            });

            return {...group, rows}
        });

        return {
            groups,
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
