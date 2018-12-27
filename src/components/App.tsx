import * as React from "react"

import {RecipeGroup} from "./RecipeGroup"
import * as game from "../game"

import {AppState, withState} from '../state'
import {withGame} from '../context'

interface Props {
    gameData: game.GameData
    state: AppState
}


function UnwrappedApp(props: Props) {
    return (
        <div className="container">
            <RecipeGroup rows={props.state.rows} />
        </div>
    )
}

export const App = withGame(withState(UnwrappedApp))
