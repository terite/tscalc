import React, { useMemo } from 'react';
import { RecipeOutput } from './RecipeOutput';
import { RecipeRowData } from '../state';
import { useGameData } from '../atoms';
import { Totals } from '../totals';

import styles from './TotalCard.module.css';

interface Props {
  rows: RecipeRowData[];
}

export const TotalCard: React.FC<Props> = ({ rows }) => {
  const gameData = useGameData();

  const { ingredients, products } = useMemo(() => {
    const totals = new Totals(rows);

    const reduced = totals.reduce();
    gameData.sortByItem(reduced.ingredients, (p) => p.item);
    gameData.sortByItem(reduced.products, (p) => p.item);
    return reduced;
  }, [gameData, rows]);

  if (!ingredients.length && !products.length) {
    return <div />;
  }

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
};
