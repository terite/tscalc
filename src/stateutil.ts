import * as game from './game';
import { AppState } from './state';
import { assert } from './util';

export function getDefaultMachine(
  input: game.Recipe | string,
  state: AppState,
  gameData: game.GameData
): game.AssemblingMachine {
  const category = input instanceof game.Recipe ? input.category : input;

  let defaultMachine: game.AssemblingMachine;
  if (category in state.settings.assemblerOverrides) {
    defaultMachine = state.settings.assemblerOverrides[category];
  } else {
    defaultMachine = gameData.categoryMap[category][0];
  }

  if (input instanceof game.Recipe) {
    assert(input.madeIn.indexOf(defaultMachine) !== -1);
  }

  return defaultMachine;
}
