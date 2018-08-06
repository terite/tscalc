import * as game from "./game"
import {RecipeRow} from './components/RecipeRow'
import {Rational} from './rational'


export class Totals {

    itemAmounts: {[name: string]: Rational} = {}

    fluidAmounts: {
        [name: string]: [{
            temp_min: number
            temp_max: number
            amount: Rational
        }]
    } = {}

    addAmount(item: game.Item, amount: Rational): void;
    addAmount(item: game.Fluid, amount: Rational, t_min: number, t_max: number): void;
    addAmount(item: game.Item | game.Fluid, amount: Rational, t_min?: number, t_max?: number) {
        if (item.type == 'fluid') {
            console.log(`${amount.toString()} ${item.name} [${t_min}-${t_max}]c`)
            for (let fluidName in this.fluidAmounts) {

            }
            // let key = item.name
            // let prev = this.fluidAmounts[key] || Rational.zero
            // this.itemAmounts[key] = prev.add(amount)
        } else {
            let key = item.name
            let prev = this.itemAmounts[key] || Rational.zero
            this.itemAmounts[key] = prev.add(amount)
        }
    }

    addProduct(prod: game.Product, multiplier: Rational) {
        let amount = prod.amount.mul(multiplier)
        if(prod.type == "fluid") {
            this.addAmount(prod.item, amount, prod.temperature, prod.temperature)
        } else {
            this.addAmount(prod.item, amount)
        }
    }

    addIngredient(ing: game.Ingredient, multiplier: Rational) {
        let amount = ing.amount.mul(multiplier).negate()
        if(ing.type == "fluid") {
            this.addAmount(ing.item, amount, ing.minimum_temperature, ing.maximum_temperature)
        } else {
            this.addAmount(ing.item, amount)
        }
    }

    static fromRecipeRow(row: RecipeRow): Totals {
        const t = new Totals()
        const recipe = row.props.recipe

        let mult = Rational.fromFloat(row.state.numMachines)

        for (let ing of recipe.ingredients) {
            t.addIngredient(ing, mult)
        }
        
        for (let prod of recipe.products) {
            t.addProduct(prod, mult)
        }

        return t
    }

}
