import * as game from "./game"

import {clone} from './util'

import {Rational} from "./rational"

import {Props as RecipeRowProps} from "./components/RecipeRow"


export class Totals {
    products: game.Product[] = []
    ingredients: game.Ingredient[] = []

    addIngredient = (newIng: game.Ingredient) => {
        for (let oldIng of this.ingredients) {
            let match = (
                newIng.type == oldIng.type &&
                newIng.item == oldIng.item)
            if (newIng.type == "fluid" && oldIng.type == "fluid") {
                match = match && (
                    newIng.maximum_temperature == oldIng.maximum_temperature &&
                    newIng.minimum_temperature == oldIng.minimum_temperature)
            }

            if (match) {
                oldIng.amount = oldIng.amount.add(newIng.amount)
                return
            }
        }
        this.ingredients.push(newIng)
    }

    addProduct = (newProd: game.Product) => {
        for (let oldProd of this.products) {
            let match = (
                newProd.type == oldProd.type &&
                newProd.item == oldProd.item)
            if (newProd.type == "fluid" && oldProd.type == "fluid") {
                match = match && newProd.temperature == oldProd.temperature
            }

            if (match) {
                oldProd.amount = oldProd.amount.add(newProd.amount)
                return
            }
        }
        this.products.push(newProd)
    }

    addRow(row: RecipeRowProps) {
        let mult = Rational.one
            .mul(row.recipe.crafting_time.invert())
            .mul(row.numMachines)
            .mul(row.machine.data.crafting_speed)

        row.recipe.ingredients
            .map((ingredient) => {
                ingredient = clone(ingredient)
                ingredient.amount = ingredient.amount.mul(mult)
                return ingredient
            })
            .forEach(this.addIngredient)

        row.recipe.products
            .map((product) => {
                product = clone(product)
                product.amount = product.amount.mul(mult)
                return product
            })
            .forEach(this.addProduct)
    }

    reduce() {
        let ingredients = this.ingredients.map(clone)
        let products = this.products.map(clone)

        for (let product of products) {
            for (let ingredient of ingredients) {
                if (product.amount.isZero() || ingredient.amount.isZero()) {
                    continue
                }
                if (!product.satisfies(ingredient)) {
                    continue
                }
                if (product.amount.less(ingredient.amount)) {
                    // More ingredient than product
                    ingredient.amount = ingredient.amount.sub(product.amount)
                    product.amount = Rational.zero
                } else if (ingredient.amount.less(product.amount)) {
                    // More product than ingredient
                    product.amount = product.amount.sub(ingredient.amount)
                    ingredient.amount = Rational.zero
                } else {
                    ingredient.amount = Rational.zero
                    product.amount = Rational.zero
                }
            }
        }

        ingredients = ingredients.filter(i => !i.amount.isZero())
        products = products.filter(p => !p.amount.isZero())

        return {ingredients, products}
    }
}
