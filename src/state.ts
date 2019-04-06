import { createDakpan } from 'dakpan';

import * as game from './game';
import { Rational } from './rational';
import { getDefaultMachine } from './stateutil';

export interface RecipeRowData {
    recipe: game.Recipe;
    machine: game.Entity.AssemblingMachine;
    numMachines: Rational;
    modules: (game.Module | null)[];
    beaconModule: game.Module | null;
    numBeacons: number;
}

export interface RecipeGroupData {
    name: string;
    rows: RecipeRowData[];
}

export interface AppSettingsData {
    assemblerOverrides: {
        [category: string]: game.Entity.AssemblingMachine;
    };
}

export interface RecipeTarget {
    item: game.Item | game.Fluid;
    amount: Rational;
}

export interface AppState {
    // Loaded automatically
    gameData: game.GameData;

    // Preserved via url/localstorage
    groups: RecipeGroupData[];
    settings: AppSettingsData;

    // unsaved state
    activeGroupIdx: number;
    recipeTarget: RecipeTarget | undefined;
}

export const defaultState: AppState = {
    gameData: {} as game.GameData, // set early by apploader
    groups: [
        {
            name: 'Factory 1',
            rows: [],
        },
    ],
    settings: {
        assemblerOverrides: {},
    },

    activeGroupIdx: 0,
    recipeTarget: undefined,
};

function getActiveGroup(state: AppState) {
    return state.groups[state.activeGroupIdx];
}

function updateGroup(state: AppState, newGroup: Partial<RecipeGroupData>) {
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
        if (group.rows.some((r) => r.recipe.name == row.recipe.name)) {
            return {};
        }

        return updateGroup(state, { rows: [...group.rows, row] });
    },

    updateRow: (i: number, updates: Partial<RecipeRowData>) => (state) => {
        const group = getActiveGroup(state);
        const rows = Array.from(group.rows);
        rows[i] = { ...group.rows[i], ...updates };
        return updateGroup(state, {
            rows: rows,
        });
    },

    removeRow: (i: number) => (state) => {
        const group = getActiveGroup(state);
        const rows = Array.from(group.rows);
        rows.splice(i, 1);
        return updateGroup(state, {
            rows: rows,
        });
    },

    moveRow: (oldIndex: number, newIndex: number) => (state) => {
        const group = getActiveGroup(state);
        const rows = Array.from(group.rows);

        const [removed] = rows.splice(oldIndex, 1);
        rows.splice(newIndex, 0, removed);

        return updateGroup(state, {
            rows: rows,
        });
    },

    updateDefaultMachine: (category, newMachine) => (state) => {
        const oldMachine = getDefaultMachine(category, state);

        const groups = state.groups.map((group) => {
            const rows = group.rows.map((row) => {
                if (
                    row.recipe.category != category ||
                    row.machine != oldMachine
                ) {
                    return row;
                }
                return {
                    ...row,
                    machine: newMachine,
                };
            });

            return { ...group, rows };
        });

        return {
            groups,
            settings: {
                ...state.settings,
                assemblerOverrides: {
                    ...state.settings.assemblerOverrides,
                    [category]: newMachine,
                },
            },
        };
    },

    setActiveGroup: (index: number) => (_) => {
        return { activeGroupIdx: index };
    },

    addGroup: (name) => (state) => {
        const groups = [
            ...state.groups,
            {
                name,
                rows: [],
            },
        ];

        return {
            groups,
            activeGroupIdx: state.groups.length,
        };
    },

    removeGroup: (index) => (state) => {
        // Remove group
        const groups = Array.from(state.groups);
        groups.splice(index, 1);

        // Add new group if necessary
        if (!groups.length) {
            groups.push({
                name: 'Factory 1',
                rows: [],
            });
        }

        // Fix the index if it's outside of bounds
        const maxIndex = groups.length - 1;
        const activeGroupIdx = Math.min(state.activeGroupIdx, maxIndex);

        return {
            groups,
            activeGroupIdx,
        };
    },

    setRecipeTarget: (recipeTarget: RecipeTarget) => () => {
        return {
            recipeTarget,
        };
    },
});

export const withBoth = State.withConsumer((state, actions) => ({
    state,
    actions,
}));
export const withGame = State.withConsumer((state) => ({
    gameData: state.gameData,
}));

export default State;
