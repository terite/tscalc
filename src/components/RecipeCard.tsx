import * as React from "react"

import * as game from "../game"


import {Icon} from './Icon'
import {MachineCard} from './MachineCard'

type Props = {
    gameData: game.GameData
    recipe: game.Recipe
    onClick?(r: game.Recipe): void
}

export class RecipeCard extends React.Component<Props, {}> {
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

        let madeIn = recipe.madeIn.map((machine, i) =>
            <Icon
                key={i}
                obj={machine.data}
                tooltip={<MachineCard machine={machine} />}
            />
        )

        return (
            <div className="recipe-tooltip card" onClick={this.handleClick}>
                <div className="card-header">
                    <Icon
                        obj={recipe}
                        text={recipe.niceName()} />
                </div>
                <div className="card-body">
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
                    <div style={{lineHeight: "32px"}}>
                        Made In:
                        {madeIn}
                    </div>
                </div>
            </div>
        )
    }
}
