import * as React from 'react';

import * as game from '../game';

import { Icon } from './Icon';
import { MachineCard } from './MachineCard';
import { withGame } from '../state';

interface Props {
  gameData: game.GameData;
  recipe: game.Recipe;
  onClick?(r: game.Recipe): void;
}

const GameRecipeCard = (props: Props) => {
  const handleClick = () => {
    props.onClick && props.onClick(props.recipe);
  };
  const recipe = props.recipe;

  const ingredients = recipe.ingredients.map((ingredient, i) => (
    <Icon key={i} obj={ingredient.item} text={ingredient.niceName()} />
  ));
  const products = recipe.products.map((product, i) => (
    <Icon key={i} obj={product.item} text={product.niceName()} />
  ));

  const madeIn = recipe.madeIn.map((machine, i) => (
    <Icon
      key={i}
      obj={machine.data}
      tooltip={<MachineCard machine={machine} />}
    />
  ));

  return (
    <div className="recipe-tooltip card" onClick={handleClick}>
      <div className="card-header">
        <Icon obj={recipe} text={`${recipe.niceName()} (Recipe)`} />
      </div>
      <div className="card-body">
        <b>Ingredients:</b>
        {ingredients}
        <Icon
          obj={props.gameData.raw.sprites.extra['clock']}
          text={
            <span>
              <b>{recipe.crafting_time.toDecimal()} s</b> Crafting time
            </span>
          }
        />
      </div>
      <div className="card-body">
        <b>Products:</b>
        {products}
      </div>
      <div className="card-body">
        <b>Made In:</b>
        <br />
        {madeIn}
      </div>
    </div>
  );
};

export const RecipeCard = withGame(GameRecipeCard);
