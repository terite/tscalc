import * as React from 'react';

import { format_joules } from '../util';
import * as game from '../game';

interface Props {
  obj: game.Ingredient | game.Product;
}

export const IngredientCard: React.FC<Props> = ({ obj }) => {
  let fuelValues: React.ReactNode;
  if (obj.item.fuelValue) {
    const totalValue = format_joules(
      obj.amount.mul(obj.item.fuelValue).toFloat()
    );
    fuelValues = (
      <div className="list-group-item">
        <div>
          <b>Fuel value</b>: {format_joules(obj.item.fuelValue)}
        </div>
        <div>
          <b>Total fuel value</b>: {totalValue}
        </div>
      </div>
    );
  }

  let madeBy: React.ReactNode;
  if (obj.item.madeBy.length === 1) {
    madeBy = <div className="list-group-item">Made by 1 recipe</div>;
  } else {
    madeBy = (
      <div className="list-group-item">
        Made by {obj.item.madeBy.length} recipes
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        {obj.niceName} ({obj.item.name})
      </div>
      <div className="list-group list-group-flush">
        {fuelValues}
        {madeBy}
      </div>
    </div>
  );
};
