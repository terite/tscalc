import * as React from 'react'

import {Module} from '../game'

const niceName = {
    consumption: "Energy Consumption",
    productivity: "Productivity",
    speed: "Speed",
    pollution: "Pollution"
}

export const ModuleCard = ({module}: {module: Module}) => {
    
    let bonuses = []
    for (let bonusName in module.raw.effect) {
        let bonus = module.raw.effect[bonusName as keyof typeof module.raw.effect]!.bonus
        bonuses.push(
        <div  key={bonusName}>
            <b>{niceName[bonusName as keyof typeof niceName]}: {bonus * 100}%</b>
        </div>)
    }

    return (
        <div className="module-card card">
            <div className="card-header">
                <b>{module.niceName()}</b>
            </div>
            <div className="card-body">
                {bonuses}
            </div>
        </div>
    )
}
