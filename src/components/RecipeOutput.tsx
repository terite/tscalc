import React, { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import { Rational } from '../rational';
import * as game from '../game';
import * as signal from '../signal';

import { Icon } from './Icon';
import { IngredientCard } from './IngredientCard';

import { recipeTargetAtom } from '../atoms';

interface Props {
  obj: game.Ingredient | game.Product;
  showName?: boolean;
}

export const RecipeOutput: React.FC<Props> = ({ obj, showName }) => {
  const setRecipeTarget = useSetRecoilState(recipeTargetAtom);

  const handleClick = useCallback(
    (event: React.MouseEvent): void => {
      if (event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        setRecipeTarget({
          item: obj.item,
          amount: obj.amount,
        });
        return;
      }

      if (obj instanceof game.BaseIngredient) {
        if (obj.item.madeBy.length === 1) {
          signal.addRecipeRow.dispatch(obj.item.madeBy[0]);
        } else {
          signal.addIngredientFilter.dispatch(obj);
        }
      } else {
        if (obj.item.usedBy.length === 1) {
          signal.addRecipeRow.dispatch(obj.item.usedBy[0]);
        } else {
          signal.addProductFilter.dispatch(obj);
        }
      }
    },
    [obj, setRecipeTarget]
  );

  let text = perSecond(obj.amount);
  if (showName) {
    text = (
      <>
        {obj.item.niceName()} -- {text}
      </>
    );
  }

  return (
    <Icon
      onClick={handleClick}
      tooltip={<IngredientCard obj={obj} />}
      obj={obj.item}
      text={text}
    />
  );
};

function perSecond(rational: Rational): React.ReactNode {
  const dec = rational.toDecimal().toString();
  let amount: React.ReactNode;
  if (dec.includes('.') && dec.length > 4) {
    amount = <abbr title={rational.toFraction()}>{rational.toDecimal()}</abbr>;
  } else {
    amount = dec;
  }
  return <>{amount} / sec</>;
}
