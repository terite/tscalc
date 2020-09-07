import * as React from 'react';

import { Module } from '../game';
import { round2 } from '../util';

const niceName = {
  consumption: 'Energy Consumption',
  productivity: 'Productivity',
  speed: 'Speed',
  pollution: 'Pollution',
};

export const ModuleCard = ({ module }: { module: Module }) => {
  const bonuses = [];
  for (const [bonusName, bonus] of Object.entries(module.raw.effect)) {
    if (!bonus || !bonus.bonus) {
      continue;
    }
    bonuses.push(
      <div key={bonusName}>
        <b>
          {niceName[bonusName as keyof typeof niceName]}:{' '}
          {round2(bonus.bonus * 100, 2)}%
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
