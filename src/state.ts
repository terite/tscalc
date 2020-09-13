import React from 'react';
import { createDakpan } from 'dakpan';

import * as game from './game';
import { Rational } from './rational';
export { withGame } from './atoms';

export interface RecipeRowData {
  recipe: game.Recipe;
  machine: game.AssemblingMachine;
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
    [category: string]: game.AssemblingMachine;
  };
}

export interface AppState {
  // Preserved via url/localstorage
  groups: RecipeGroupData[];
  settings: AppSettingsData;

  // unsaved state
  activeGroupIdx: number;
}

export const defaultState: AppState = {
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
};

function getActiveGroup(state: AppState): RecipeGroupData {
  return state.groups[state.activeGroupIdx];
}

function updateGroup(
  state: AppState,
  newGroup: Partial<RecipeGroupData>
): AppState {
  const groups = state.groups.map((oldGroup, index) => {
    return index === state.activeGroupIdx
      ? { ...oldGroup, ...newGroup }
      : oldGroup;
  });

  return { ...state, groups };
}

export const [StateProvider, useDakpan] = createDakpan(defaultState)({
  replaceState: (newState: Partial<AppState>) => (state) => {
    return { ...state, ...newState };
  },

  addRow: (row: RecipeRowData) => (state) => {
    const group = getActiveGroup(state);
    // ignore adding duplicate rows
    if (group.rows.some((r) => r.recipe.name === row.recipe.name)) {
      return;
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

  updateDefaultMachine: (
    category: string,
    newMachine: game.AssemblingMachine
  ) => (state) => {
    const groups = state.groups.map((group) => {
      const rows = group.rows.map((row) => {
        if (row.recipe.category !== category) {
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
      ...state,
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

  setActiveGroup: (groupIdx: number) => (state) => {
    return { ...state, activeGroupIdx: groupIdx };
  },

  addGroup: (name: string, rows: RecipeRowData[] = []) => (state) => {
    const groups = [
      ...state.groups,
      {
        name,
        rows,
      },
    ];

    return {
      ...state,
      groups,
      activeGroupIdx: state.groups.length,
    };
  },

  renameGroup: (index: number, name: string) => (state) => {
    const groups = [...state.groups];
    groups[index] = { ...groups[index], name };
    return {
      ...state,
      groups,
    };
  },

  removeGroup: (index: number) => (state) => {
    // Remove group
    const groups = [...state.groups];
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
      ...state,
      groups,
      activeGroupIdx,
    };
  },
});

export type AppActions = NonNullable<ReturnType<typeof useDakpan>[1]>;

export const withBoth = <T extends React.ComponentType<any>>(
  OldComponent: T
): React.FC<
  Pick<PropsOf<T>, Exclude<keyof PropsOf<T>, 'state' | 'actions'>>
> => {
  type NewProps = Omit<PropsOf<T>, 'state' | 'actions'>;

  const WrappedComponent: React.FC<NewProps> = (props: any) => {
    const [state, actions] = useDakpan();
    return React.createElement(OldComponent, {
      state,
      actions,
      ...props,
    });
  };

  return WrappedComponent;
};

type PropsOf<
  T extends React.ComponentType<any>
> = T extends React.ComponentType<infer P> ? P : never;

export const withActions = <T extends React.ComponentType<any>>(
  OldComponent: T
): React.FC<Pick<PropsOf<T>, Exclude<keyof PropsOf<T>, 'actions'>>> => {
  type NewProps = Omit<PropsOf<T>, 'actions'>;

  const WrappedComponent: React.FC<NewProps> = (props: any) => {
    const [, actions] = useDakpan();
    return React.createElement(OldComponent, {
      actions,
      ...props,
    });
  };

  return WrappedComponent;
};
