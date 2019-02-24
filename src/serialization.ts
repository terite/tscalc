import * as game from './game'
import { Rational } from './rational'
import {AppState, AppSettingsData} from './state'
import {getDefaultMachine} from './stateutil'
import {mapValues} from './util'

import {inflate, deflate} from 'pako'

type SerializedRowV1 = [
    string, // recipe name, required
    string|null, // assembling machine, null if default
    number, // num assembling machines
    (string|null)[], // modules,
    string|undefined, // beacon module, if chosen
    number // num beacon modules
]

interface SerializedAppStateV1 {
    version: 1;
    data: SerializedRowV1[];
}

function state1to2(state: SerializedAppStateV1): SerializedAppStateV2 {
    return {
        version: 2,
        data: {
            rows: state.data,
            settings: {
                assemblerOverrides: {}
            }
        }
    };
}

interface SerializedAppStateV2 {
    version: 2;
    data: {
        rows: SerializedRowV1[]
        settings: SerializedSettings
    };
}

// V3 = v2 but compressed
function state2to3(state: SerializedAppStateV2): SerializedAppStateV3 {
    return {
        version: 3,
        data: state.data
    };
}

interface SerializedAppStateV3 {
    version: 3;
    data: SerializedAppStateV2['data']
}

// v4 is multiple groups of rows
function state3to4(state: SerializedAppStateV3): SerializedAppStateV4 {
    return {
        version: 4,
        data: {
            settings: state.data.settings,
            groups: [{
                name: 'Factory 1',
                rows: state.data.rows
            }]
        },
    };
}

// v4 has multiple groups, each with multiple rows
interface SerializedGroupV4 {
    name: string;
    rows: SerializedRowV1[];
}
interface SerializedAppStateV4 {
    version: 4;
    data: {
        groups: SerializedGroupV4[];
        settings: SerializedSettings;
    }
}

// v5 has multiple groups, each with multiple rows
function state4to5(state: SerializedAppStateV4): SerializedAppStateV5 {
    return {
        version: 5,
        data: {
            settings: state.data.settings,
            groups: state.data.groups.map(group => {
                return <SerializedGroupV5>{
                    name: group.name,
                    rows: group.rows.map(r => {
                        return [
                            r[0],
                            r[1],
                            r[2].toString(),
                            r[3],
                            r[4],
                            r[5],

                        ];
                    }),
                };
            }),
        },
    };
}
type SerializedRowV5 = [
    string, // recipe name, required
    string|null, // assembling machine, null if default
    string, // num assembling machines as a rational
    (string|null)[], // modules,
    string|undefined, // beacon module, if chosen
    number // num beacon modules
]

interface SerializedGroupV5 {
    name: string;
    rows: SerializedRowV5[];
}
interface SerializedAppStateV5 {
    version: 5;
    data: {
        groups: SerializedGroupV5[];
        settings: SerializedSettings;
    }
}

interface SerializedAppStateOther {
    version: 0;
    data: unknown;
}

type MultiSerializedAppState = | SerializedAppStateOther
    | SerializedAppStateV1
    | SerializedAppStateV2
    | SerializedAppStateV3
    | SerializedAppStateV4
    | SerializedAppStateV5;

// Latest values
// type SerializedGroup = SerializedGroupV5;
type SerializedRow = SerializedRowV5;
type SerializedAppState = SerializedAppStateV5;


interface SerializedSettings {
    assemblerOverrides: {
        [category: string]: string
    }
}

export function setLocalStorageState(state: AppState) {
    localStorage.setItem('appstate', JSON.stringify(serialize(state)));
}

export function getLocalStorageState(gameData: game.GameData): AppState | null {
    const statestr = localStorage.getItem('appstate');
    if (!statestr) {
        return null;
    }
    const stateobj: MultiSerializedAppState = JSON.parse(statestr);
    if (stateobj.version === 1) {
        (stateobj as any).version = 3;
    }

    return deserialize(gameData, stateobj);
}

export function setUrlState(state: AppState) {
    const version = 4
    let str = JSON.stringify(serialize(state).data)
    // compress
    str = btoa(deflate(str, {to: 'string'}));

    history.replaceState('', '', `#${version}-${str}`)
}

function serialize(state: AppState): SerializedAppState {

    const groups = state.groups.map((group) => {
        return {
            name: group.name,
            rows: group.rows.map((row) => {
                let machineName: string | null = row.machine.data.name
                const defaultMachine = getDefaultMachine(row.recipe, state)

                if (defaultMachine.data.name == machineName) {
                    machineName = null
                }

                const srow: SerializedRow = [
                    row.recipe.name,
                    machineName,
                    row.numMachines.toFraction(),
                    row.modules.map(m => m ? m.name : null),
                    row.beaconModule ? row.beaconModule.name : undefined,
                    row.numBeacons,
                ];
                return srow;
            }),
        };
    });

    const settings = {
        assemblerOverrides: mapValues(state.settings.assemblerOverrides, (a) => a.data.name)
    }

    return {
        version: 5,
        data: { groups, settings }
    };
}

const reStateUrl = /^#(\d+)?(?:-)?(.+)$/;

export function getUrlState(gameData: game.GameData) {
    const matches = reStateUrl.exec(document.location.hash);
    if (!matches) {
        return null;
    }
    const version = Number(matches[1] || 1);

    let str = decodeURIComponent(matches[2])
    if (version > 2) {
        str = inflate(atob(str), { to: 'string' });
    }

    let data = JSON.parse(str);

    return deserialize(gameData, {
        version: version as 0,
        data
    });
}

function migrateSerializedState(state: MultiSerializedAppState): SerializedAppState {
    switch (state.version) {
        case 1:
            state = state1to2(state);
        case 2:
            // version 2 is an uncompressed version of 3
            state = state2to3(state);
        case 3:
            state = state3to4(state);
        case 4:
            state = state4to5(state);
            break
        case 5:
            // the latest
            break
        default:
            throw new Error(`unknown state: ${state}`);
    }

    return state;
};

function deserialize(gameData: game.GameData, unmigrated: MultiSerializedAppState): AppState {
    const migrated = migrateSerializedState(unmigrated).data;

    const state: AppState = {
        gameData: gameData,
        settings: deserializeSettings(gameData, migrated.settings),
        groups: [],
        activeGroupIdx: 0,
    }

    state.groups = migrated.groups.map((group) => {
        return {
            name: group.name,
            rows: group.rows.map(([recipeName, machineName, numMachines, modules, beaconModule, numBeacons]) => {
                const recipe = gameData.recipeMap[recipeName]

                const machine = machineName
                    ? gameData.entityMap[machineName]
                    : getDefaultMachine(recipe, state)

                return {
                    recipe: recipe,
                    machine: machine,
                    numMachines: Rational.fromString(numMachines),
                    modules: modules.map(n => n ? gameData.moduleMap[n] : null),
                    beaconModule: beaconModule ? gameData.moduleMap[beaconModule] : null,
                    numBeacons: numBeacons || 0
                }
            }),
        };
    });

    return state
}

function deserializeSettings(gameData: game.GameData, serialized: SerializedSettings): AppSettingsData {
    return {
        assemblerOverrides: mapValues(serialized.assemblerOverrides, (name) => gameData.entityMap[name])
    }
}
