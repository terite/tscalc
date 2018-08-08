import { h, Component } from "preact";

import * as game from "../game"


import {Icon} from './Icon'

type Props = {
    gameData: game.GameData
    recipe: game.Recipe
    onClick?(r: game.Recipe): void
}

type State = {
}

export class RecipeCell extends Component<Props, State> {
    public handleClick = () => {
        this.props.onClick && this.props.onClick(this.props.recipe)
    }

    render() {
        let recipe = this.props.recipe

        let ingredients = recipe.ingredients.map((ingredient) =>
            <div style="line-height: 32px">
                <Icon
                    obj={ingredient.item}
                    gameData={this.props.gameData} />
                {ingredient.niceName()}
            </div>
        )
        let products = recipe.products.map((product) =>
            <div style="line-height: 32px">
                <Icon
                    obj={product.item}
                    gameData={this.props.gameData} />
                {product.niceName()}
            </div>
        )

        return (
            <div className="recipe-cell" onClick={this.handleClick}>
                <div style="display: inline-block">
                    <div style="line-height: 32px">
                        <Icon
                            obj={recipe}
                            gameData={this.props.gameData} />
                        {recipe.niceName() }
                    </div>
                    <div style="line-height: 32px">
                        <Icon
                            obj={this.props.gameData.raw.sprites.extra["clock"]}
                            gameData={this.props.gameData} />
                        { recipe.crafting_time.toString() }
                    </div>
                    {ingredients}
                </div>

                <div style="display: inline-block">
                    Products:
                    {products}
                </div>
            </div>
        )
    }
}
