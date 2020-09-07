import * as React from 'react';
import { RecipeOutput } from './RecipeOutput';
import { withGame, RecipeRowData } from '../state';
import { Totals } from '../totals';
import * as game from '../game';

import styles from './TotalCard.module.css';

interface Props {
  gameData: game.GameData;
  rows: RecipeRowData[];
}

function RawTotalCard(props: Props) {
  const totals = new Totals();
  for (const row of props.rows) {
    totals.addRow(row);
  }

  const { ingredients, products } = totals.reduce();
  if (!ingredients.length && !products.length) {
    return <div />;
  }

  props.gameData.sortByItem(products, (p) => p.item);

  return (
    <div className={`card ${styles.TotalCard}`}>
      <div className="card-header">Combined Totals</div>
      <div className="card-body">
        <div className="row">
          <div className="col">
            Ingredients:
            {ingredients.map((ing, i) => (
              <RecipeOutput key={i} obj={ing} showName />
            ))}
          </div>
          <div className="col">
            Products:
            {products.map((prod, i) => (
              <RecipeOutput key={i} obj={prod} showName />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export const TotalCard = withGame(RawTotalCard);
