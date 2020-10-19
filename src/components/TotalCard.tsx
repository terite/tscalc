import React, { useMemo } from 'react';
import { RecipePart } from './RecipePart';
import { RecipeRowData } from '../state';
import { useGameData } from '../atoms';
import { Totals } from '../totals';

import styles from './TotalCard.module.css';

interface Props {
  rows: RecipeRowData[];
}

export const TotalCard: React.FC<Props> = ({ rows }) => {
  const gameData = useGameData();

  const totals: Totals = useMemo(() => {
    const t = new Totals(rows);
    gameData.sortByItem(t.ingredients, (p) => p.item);
    gameData.sortByItem(t.products, (p) => p.item);
    return t;
  }, [gameData, rows]);

  if (!totals.ingredients.length && !totals.products.length) {
    return <div />;
  }

  return (
    <div className={`card ${styles.TotalCard}`}>
      <div className="card-header">Combined Totals</div>
      <div className="card-body">
        <div className="row">
          <div className="col">
            Ingredients:
            {totals.ingredients.map((ing) => (
              <RecipePart key={ing.name} obj={ing} showName />
            ))}
          </div>
          <div className="col">
            Products:
            {totals.products.map((prod) => (
              <RecipePart key={prod.name} obj={prod} showName />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
