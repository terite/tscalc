import * as game from './game';
import { AppSettingsData } from './state';
import { assert } from './util';

export function getDefaultMachine(
  input: game.Recipe | string,
  settings: AppSettingsData,
  gameData: game.GameData
): game.AssemblingMachine {
  const category = input instanceof game.Recipe ? input.category : input;

  let defaultMachine: game.AssemblingMachine;
  if (category in settings.assemblerOverrides) {
    defaultMachine = settings.assemblerOverrides[category];
  } else {
    defaultMachine = gameData.categoryMap[category][0];
  }

  if (input instanceof game.Recipe) {
    assert(input.madeIn.indexOf(defaultMachine) !== -1);
  }

  return defaultMachine;
}
