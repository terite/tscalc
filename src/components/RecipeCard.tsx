import * as React from "react";

import * as game from "../game";

import { Icon } from "./Icon";
import { MachineCard } from "./MachineCard";
import { withGame } from "../state";

interface Props {
    gameData: game.GameData;
    recipe: game.Recipe;
    onClick?(r: game.Recipe): void;
};

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
                <Icon obj={recipe} text={recipe.niceName()} />
            </div>
            <div className="card-body">
                <Icon
                    obj={props.gameData.raw.sprites.extra["clock"]}
                    text={recipe.crafting_time.toDecimal()}
                />
                <div style={{ float: "left" }}>
                    Ingredients:
                    {ingredients}
                </div>
                <div style={{ display: "inline-block" }}>
                    Products:
                    {products}
                </div>
                <div style={{ clear: "both" }} />
                <div style={{ lineHeight: "32px" }}>
                    Made In:
                    {madeIn}
                </div>
            </div>
        </div>
    );
};

export const RecipeCard = withGame(GameRecipeCard);
