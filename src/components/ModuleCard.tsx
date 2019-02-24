import * as React from "react";

import { Module } from "../game";
import { round2 } from "../util";

const niceName = {
    consumption: "Energy Consumption",
    productivity: "Productivity",
    speed: "Speed",
    pollution: "Pollution",
};

export const ModuleCard = ({ module }: { module: Module }) => {
    const bonuses = [];
    for (let bonusName in module.raw.effect) {
        const bonus = module.raw.effect[
            bonusName as keyof typeof module.raw.effect
        ]!.bonus;
        bonuses.push(
            <div key={bonusName}>
                <b>
                    {niceName[bonusName as keyof typeof niceName]}:{" "}
                    {round2(bonus * 100, 2)}%
                </b>
            </div>
        );
    }

    return (
        <div className="module-card card">
            <div className="card-header">
                <b>{module.niceName()}</b>
            </div>
            <div className="card-body">{bonuses}</div>
        </div>
    );
};
