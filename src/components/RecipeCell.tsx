import * as React from "react"

import * as game from "../game"


import {Icon} from './Icon'

type Props = {
    gameData: game.GameData
    recipe: game.Recipe
    onClick?(r: game.Recipe): void
}

export class RecipeCell extends React.Component<Props, {}> {
    public handleClick = () => {
        this.props.onClick && this.props.onClick(this.props.recipe)
    }

    render() {
        let recipe = this.props.recipe

        let ingredients = recipe.ingredients.map((ingredient, i) =>
            <Icon
                key={i}
                obj={ingredient.item}
                text={ingredient.niceName()} />
        )
        let products = recipe.products.map((product, i) =>
            <Icon
                key={i}
                obj={product.item}
                text={product.niceName()} />
        )

        return (
            <div className="recipe-cell" onClick={this.handleClick}>
                <Icon
                    obj={recipe}
                    text={recipe.niceName()} />
                <Icon
                    obj={this.props.gameData.raw.sprites.extra["clock"]}
                    text={recipe.crafting_time.toString()} />
                <div style={{float:"left"}}>
                    Ingredients:
                    {ingredients}
                </div>
                <div style={{display: "inline-block"}}>
                    Products:
                    {products}
                </div>
                <div style={{clear: "both"}} />
            </div>
        )
    }
}
