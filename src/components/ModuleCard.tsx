import React from 'react';

import type { Rational } from '../rational';
import type { Module } from '../game';
import { round2 } from '../util';

interface Props {
  module: Module;
}

function formatBonus(name: string, bonus: Rational): React.ReactNode {
  if (bonus.isZero()) return null;
  return (
    <div>
      <b>
        {name} {round2(bonus.toFloat() * 100, 2)}%
      </b>
    </div>
  );
}

export const ModuleCard: React.FC<Props> = ({ module }) => {
  return (
    <div className="module-card card">
      <div className="card-header">
        <b>{module.niceName}</b>
      </div>
      <div className="card-body">
        {formatBonus('Speed', module.effects.speed)}
        {formatBonus('Productivity', module.effects.productivity)}
        {formatBonus('Energy Consumption', module.effects.consumption)}
        {formatBonus('Pollution', module.effects.pollution)}
      </div>
    </div>
  );
};
