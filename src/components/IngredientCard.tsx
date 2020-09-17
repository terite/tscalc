import * as React from 'react';

import { format_joules, format_watts } from '../util';
import * as game from '../game';

interface Props {
  obj: game.Ingredient | game.Product;
}

export const IngredientCard: React.FC<Props> = (props) => {
  const { obj } = props;

  let extras: JSX.Element[] = [];

  let fuel_value: number = 0;

  if (obj instanceof game.FluidIngredient || obj instanceof game.FluidProduct) {
    const { item } = obj;
    fuel_value = item.raw.fuel_value;
  } else {
    if ('fuel_value' in obj.item.raw) {
      fuel_value = obj.item.raw.fuel_value;
    }
  }

  if (fuel_value) {
    extras.push(
      <>
        <b>Fuel value</b>: {format_joules(fuel_value)}
      </>
    );

    let totalValue = format_watts(obj.amount.mul(fuel_value).toFloat());
    extras.push(
      <>
        <b>Total fuel value</b>: {totalValue}
      </>
    );
  }

  let body: React.ReactNode = '';
  if (extras.length) {
    body = (
      <div className="card-body">
        {extras.map((extra, i) => (
          <div key={i} children={extra} />
        ))}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        {obj.item.niceName()} ({obj.item.name})
      </div>
      {body}
    </div>
  );
};
