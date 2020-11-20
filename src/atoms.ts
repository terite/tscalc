import { atom, selector, useRecoilValue, RecoilState } from 'recoil';
import type { AppSettingsData, RecipeGroupData } from './state';
import type { GameData, Fluid, Item } from './game';
import type { Rational } from './rational';

//
// GameData
//
export const gameDataAtom = atom<GameData | null>({
  key: 'gameData',

  // set early by apploader
  default: null,
});

export const useGameData = (): GameData => {
  const gameData = useRecoilValue(gameDataAtom);
  if (!gameData) {
    throw new Error('useGameData called without gameData available');
  }
  return gameData;
};

//
// RecipeTarget
//
export interface RecipeTarget {
  item: Item | Fluid;
  amount: Rational;
}

export const recipeTargetAtom = atom<RecipeTarget | undefined>({
  key: 'recipeTarget',
  default: undefined,
});

//
// Groups
//
export type GroupAtom = RecoilState<RecipeGroupData>;
export const groupAtomsAtom = atom<GroupAtom[]>({
  key: 'groupAtoms',
  default: [],
});

export const groupsState = selector<[RecipeGroupData, GroupAtom][]>({
  key: 'groupsState',
  get: ({ get }) => {
    const groupAtoms = get(groupAtomsAtom);
    return groupAtoms.map((groupAtom) => [get(groupAtom), groupAtom]);
  },
});

//
// Settings
//
export const settingsAtom = atom<AppSettingsData>({
  key: 'settings',
  default: {
    assemblerOverrides: {},
  },
});
