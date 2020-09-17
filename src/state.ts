import * as game from './game';
import type { Rational } from './rational';

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

export interface CompleteState {
  groups: RecipeGroupData[];
  settings: AppSettingsData;
}
