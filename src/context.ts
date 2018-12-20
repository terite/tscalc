import * as React from 'react'

import {GameData} from './game'

export const GameContext = React.createContext<GameData>({} as GameData)

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

const withContext = <TContext>(
  context: React.Context<TContext>
) => <H>(
  map: (value: TContext) => H
) => <P>(
  component: React.ComponentType<P & H>
) => {
  const WithConsumer = (props: Omit<P, keyof H>) => React.createElement(context.Consumer, {
    children: (value: TContext) => React.createElement(component, {
      ...props as any,
      ...map(value) as any
    })
  });

  return WithConsumer;
};


export const withGame = withContext(GameContext)(function (gameData: GameData) {
    return {gameData}
});
