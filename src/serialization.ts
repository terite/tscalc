import * as game from './game'
import {AppState} from './state'

type SerializedAppState = SerializedRow[]

type SerializedRow = [
    string, // recipe
    string, // assembling machine
    number, // num assembling machines
    Array<string|null>, // modules,
    string|undefined, // beacon module
    number|undefined // num beacon modules
]

export function getUrlState(gameData: game.GameData) {
    if (document.location.hash.startsWith('#[')) {
        const hash = decodeURIComponent(document.location.hash.substr(1))
        const d = JSON.parse(hash)
        return deserialize(gameData, d)
    }
    return null
}

export function setUrlState(state: AppState) {
    history.replaceState('', '', `#${JSON.stringify(serialize(state))}`)
}

function serialize(state: AppState): SerializedAppState {
    return state.rows.map((row):SerializedRow => [
        row.recipe.name,
        row.machine.data.name,
        row.numMachines,
        row.modules.map(m => m ? m.name : null),
        row.beaconModule ? row.beaconModule.name : undefined,
        row.numBeacons,
    ])
}

function deserialize(gameData: game.GameData, state: SerializedAppState): AppState {
    const gd = gameData

    const rows = state.map(([recipe, machine, numMachines, modules, beaconModule, numBeacons]) => ({
        recipe: gd.recipeMap[recipe],
        machine: gd.entityMap[machine],
        numMachines,
        modules: modules.map(n => n ? gd.moduleMap[n] : null),
        beaconModule: beaconModule ? gd.moduleMap[beaconModule] : null,
        numBeacons: numBeacons || 0
    }))

    return {rows}
}
