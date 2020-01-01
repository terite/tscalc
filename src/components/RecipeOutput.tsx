import * as React from 'react';

import { Rational } from '../rational';
import * as game from '../game';
import * as signal from '../signal';

import { Icon } from './Icon';
import { IngredientCard } from './IngredientCard';
import { AppActions, withActions } from '../state';

interface Props {
  actions: AppActions;
  obj: game.Ingredient | game.Product;
  showName?: boolean;
}

class RawRecipeOutput extends React.PureComponent<Props, never> {
  handleClick = (
    event: React.MouseEvent
  ) => {
    const { obj } = this.props;

    if (event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      this.props.actions.setRecipeTarget({
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

  };

  render() {
    const { obj, showName } = this.props;

    let text = perSecond(obj.amount);
    if (showName) {
      text = <>{obj.item.niceName()} -- {text}</>
    }

    return <Icon
      onClick={this.handleClick}
      tooltip={<IngredientCard obj={obj} />}
      obj={obj.item}
      text={text}
    />;
  }
}

function perSecond(rational: Rational): React.ReactNode {
  const dec = rational.toDecimal().toString();
  let amount: React.ReactNode;
  if (dec.includes('.') && dec.length > 4) {
    amount =<abbr title={rational.toFraction()}>{rational.toDecimal()}</abbr>
  } else {
    amount = dec;
  }
  return <>{amount} / sec</>
}

export const RecipeOutput = withActions(RawRecipeOutput);
