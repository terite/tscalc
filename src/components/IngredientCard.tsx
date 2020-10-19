import * as React from 'react';

import { format_joules, format_watts } from '../util';
import * as game from '../game';

interface Props {
  obj: game.Ingredient | game.Product;
}

export const IngredientCard: React.FC<Props> = (props) => {
  const { obj } = props;

  let fuelValues: React.ReactNode;
  if (obj.item.fuelValue) {
    const totalValue = format_watts(
      obj.amount.mul(obj.item.fuelValue).toFloat()
    );
    fuelValues = (
      <div className="card-body">
        <div>
          <b>Fuel value</b>: {format_joules(obj.item.fuelValue)}
        </div>
        <div>
          <b>Total fuel value</b>: {totalValue}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        {obj.item.niceName} ({obj.item.name})
      </div>
      {fuelValues}
    </div>
  );
};
