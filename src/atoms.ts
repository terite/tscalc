import React from 'react';

import { atom, useRecoilValue } from 'recoil';
import type { GameData, Fluid, Item } from './game';
import type { Rational } from './rational';

type PropsOf<
  T extends React.ComponentType<any>
> = T extends React.ComponentType<infer P> ? P : never;

enum AtomKey {
  gameState = 'gameState',
  recipeTarget = 'recipeTarget',
}

//
// GameData
//
export const gameDataAtom = atom<GameData | null>({
  key: AtomKey.gameState,

  // set early by apploader
  default: null,
});

type NoProp<T extends React.ComponentType<any>, P> = React.ComponentType<
  Pick<PropsOf<T>, Exclude<keyof PropsOf<T>, P>>
>;

export const withGame = <T extends React.ComponentType<any>>(
  OldComponent: T
): NoProp<T, 'gameData'> => {
  type NewProps = Omit<PropsOf<T>, 'gameData'>;

  const WrappedComponent: React.FC<NewProps> = (props: any) => {
    const gameData = useRecoilValue(gameDataAtom);
    if (!gameData) throw new Error('No gameData');

    return React.createElement(OldComponent, {
      gameData: gameData,
      ...props,
    });
  };

  return WrappedComponent;
};

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
  key: AtomKey.recipeTarget,
  default: undefined,
});
