import * as game from './game';
import { AppState } from './state';
import { assert } from './util';

export function getDefaultMachine(
    category: string,
    state: AppState
): game.AssemblingMachine;
export function getDefaultMachine(
    recipe: game.Recipe,
    state: AppState
): game.AssemblingMachine;

export function getDefaultMachine(
    input: game.Recipe | string,
    state: AppState
): game.AssemblingMachine {
    const category = input instanceof game.Recipe ? input.category : input;

    let defaultMachine: game.AssemblingMachine;
    if (category in state.settings.assemblerOverrides) {
        defaultMachine = state.settings.assemblerOverrides[category];
    } else {
        defaultMachine = state.gameData.categoryMap[category][0];
    }

    if (input instanceof game.Recipe) {
        assert(input.madeIn.indexOf(defaultMachine) !== -1);
    }

    return defaultMachine;
}
