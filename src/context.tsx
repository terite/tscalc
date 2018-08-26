import * as React from 'react'

import {GameData} from './game'

export const GameContext = React.createContext<GameData>({} as GameData)

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export function withGame<P extends {gameData: GameData}>(Component: React.ComponentType<P>)
    : (props: Omit<P, 'gameData'>) => JSX.Element {
    return (props: Omit<P, 'gameData'>) => {
        return (<GameContext.Consumer>
            {gameData => <Component {...props} gameData={gameData} />}
        </GameContext.Consumer>)
    }
}
