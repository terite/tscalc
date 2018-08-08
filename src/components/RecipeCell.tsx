import * as React from "react"

import * as game from "../game"


import {Icon} from './Icon'

type Props = {
    gameData: game.GameData
    recipe: game.Recipe
    onClick?(r: game.Recipe): void
}

type State = {
}

export class RecipeCell extends React.Component<Props, State> {
    public handleClick = () => {
        this.props.onClick && this.props.onClick(this.props.recipe)
    }

    render() {
        let recipe = this.props.recipe

        let ingredients = recipe.ingredients.map((ingredient, i) =>
            <Icon
                key={i}
                obj={ingredient.item}
                gameData={this.props.gameData}
                text={ingredient.niceName()} />
        )
        let products = recipe.products.map((product, i) =>
            <Icon
                key={i}
                obj={product.item}
                gameData={this.props.gameData} 
                text={product.niceName()} />
        )

        return (
            <div className="recipe-cell" onClick={this.handleClick}>
                <div style={{display: "inline-block"}}>
                    <Icon
                        obj={recipe}
                        gameData={this.props.gameData} 
                        text={recipe.niceName()} />
                    <Icon
                        obj={this.props.gameData.raw.sprites.extra["clock"]}
                        gameData={this.props.gameData} 
                        text={recipe.crafting_time.toString()} />
                    {ingredients}
                </div>

                <div style={{display: "inline-block"}}>
                    Products:
                    {products}
                </div>
            </div>
        )
    }
}
