import * as React from 'react';

import * as game from '../game';

import { Icon } from './Icon';
import { MachineCard } from './MachineCard';
import { useGameData } from '../atoms';

interface Props {
  recipe: game.Recipe;
  onClick?(r: game.Recipe): void;
}

export const RecipeCard: React.FC<Props> = ({ recipe, onClick }) => {
  const gameData = useGameData();

  const handleClick = (): void => {
    onClick && onClick(recipe);
  };

  const ingredients = recipe.ingredients.map((ingredient) => (
    <Icon
      key={ingredient.name}
      obj={ingredient.item}
      text={ingredient.niceName}
    />
  ));
  const products = recipe.products.map((product) => (
    <Icon key={product.name} obj={product.item} text={product.niceName} />
  ));

  const madeIn = recipe.madeIn.map((machine) => (
    <Icon
      key={machine.name}
      obj={machine}
      tooltip={() => <MachineCard machine={machine} />}
    />
  ));

  return (
    <div className="recipe-tooltip card" onClick={handleClick}>
      <div className="card-header">
        <Icon obj={recipe} text={`${recipe.niceName} (Recipe)`} />
      </div>
      <ul className="list-group list-group-flush">
        <li className="list-group-item">
          <b>Ingredients:</b>
          {ingredients}
          <Icon
            obj={gameData.clockSprite}
            text={
              <span>
                <b>{recipe.craftingTime.toDecimal()} s</b> Crafting time
              </span>
            }
          />
        </li>
        <li className="list-group-item">
          <b>Products:</b>
          {products}
        </li>
        <li className="list-group-item">
          <b>Made In:</b>
          <br />
          {madeIn}
        </li>
      </ul>
    </div>
  );
};
