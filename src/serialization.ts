import * as game from './game'
import {AppState, AppSettingsData} from './state'
import {getDefaultMachine} from './stateutil'
import {mapValues} from './util'

import {inflate, deflate} from 'pako'

const USE_COMPRESSION=false

interface SerializedAppState {
    rows: SerializedRow[]
    settings: SerializedSettings
}

interface SerializedSettings {
    assemblerOverrides: {
        [category: string]: string
    }
}

type SerializedRow = [
    string, // recipe name, required
    string|null, // assembling machine, null if default
    number, // num assembling machines
    (string|null)[], // modules,
    string|undefined, // beacon module, if chosen
    number // num beacon modules
]

export function setUrlState(state: AppState) {
    const version = 2
    let str = JSON.stringify(serialize(state))
    if (USE_COMPRESSION) {
        str = btoa(deflate(str, {to: 'string'}));
    }
    history.replaceState('', '', `#${version}-${str}`)
}

function serialize(state: AppState): SerializedAppState {
    return {
        rows: state.rows.map((row):SerializedRow => {
            let machineName: string | null = row.machine.data.name
            const defaultMachine = getDefaultMachine(row.recipe, state)

            if (defaultMachine.data.name == machineName) {
                machineName = null
            }

            return [
                row.recipe.name,
                machineName,
                row.numMachines,
                row.modules.map(m => m ? m.name : null),
                row.beaconModule ? row.beaconModule.name : undefined,
                row.numBeacons,
            ]
        }),
        settings: {
            assemblerOverrides: mapValues(state.settings.assemblerOverrides, (a) => a.data.name)
        }
    }
}

const reStateUrl = /^#(\d+)?(?:-)?(.+)$/;

export function getUrlState(gameData: game.GameData) {
    const matches = reStateUrl.exec(document.location.hash);
    if (!matches) {
        return null
    }
    const version = Number(matches[1] || 1)

    let str = decodeURIComponent(matches[2])
    if (USE_COMPRESSION && version >= 2) {
        str = inflate(atob(str), { to: 'string' });
    }

    let data = JSON.parse(str)

    // Fixups
    switch (version) {
        case 1:
            // version 1 didn't have support for settings
            const settings: AppSettingsData = {
                assemblerOverrides: {}
            }
            data = {
                rows: data,
                settings: settings
            }
        case 2:
            // the latest
            break

        default:
            throw new Error(`unknown state version: ${version}`)
    }

    return deserialize(gameData, data)
}

function deserialize(gameData: game.GameData, serialized: SerializedAppState): AppState {
    const state: AppState = {
        gameData: gameData,
        settings: deserializeSettings(gameData, serialized.settings),
        rows: []
    }

    state.rows = serialized.rows.map(([recipeName, machineName, numMachines, modules, beaconModule, numBeacons]) => {
        const recipe = gameData.recipeMap[recipeName]

        const machine = machineName
            ? gameData.entityMap[machineName]
            : getDefaultMachine(recipe, state)

        return {
            recipe: recipe,
            machine: machine,
            numMachines,
            modules: modules.map(n => n ? gameData.moduleMap[n] : null),
            beaconModule: beaconModule ? gameData.moduleMap[beaconModule] : null,
            numBeacons: numBeacons || 0
        }
    })

    return state
}

function deserializeSettings(gameData: game.GameData, serialized: SerializedSettings): AppSettingsData {
    return {
        assemblerOverrides: mapValues(serialized.assemblerOverrides, (name) => gameData.entityMap[name])
    }
}
