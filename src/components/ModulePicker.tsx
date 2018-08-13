import * as React from 'react'

import {GameData, Module, Recipe} from '../game'

import {Icon} from './Icon'
import {ModuleCard} from './ModuleCard'
import {Dropdown} from './generic'
import {withGame} from "../context"


interface ModulePickerProps {
    gameData: GameData
    recipe: Recipe
    selected: Module|null
    onChange(m: Module|null): void
}

const GameModulePicker = (props: ModulePickerProps) => {
    let icon = props.gameData.raw.sprites.extra.slot_icon_module
    const nomod = new Module({
        type: "module",
        name: "no_module",
        localised_name: {en: "No Module"},
        category: "speed",
        effect: {},
        limitation: [],
        rocket_launch_products: [],

        icon_row: icon.icon_row,
        icon_col: icon.icon_col,

        group: "",
        subgroup: "",
        order: "",
    })

    const renderSelected = (module: Module|null) => {
        if (module) {
            return <Icon
                obj={module}
                tooltip={<ModuleCard module={module} />}
                />
        } else {
            return <Icon obj={nomod} />
        }
    }

    const renderOption = (module: Module|null) => {
        if (module) {
            return <Icon
                obj={module}
                tooltip={<ModuleCard module={module} />}
                text={module.niceName()}
                />
        } else {
            return <Icon obj={nomod} text={nomod.niceName()} />
        }
    }


    const options = props.gameData.modules
        .filter(m => m.canUseWith(props.recipe))
        .map(m => ({
            key: m.name,
            option: m as Module|null,
            active: m == props.selected,
        }))

    options.unshift({
        key: "no_module",
        option: null,
        active: !props.selected
    })

    return <Dropdown
        options={options}
        selected={props.selected}
        onSelect={props.onChange}
        renderOption={renderOption}
        renderSelected={renderSelected}
    />
}

export const ModulePicker = withGame(GameModulePicker)
