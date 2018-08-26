import * as game from "./game"

import {clone} from './util'

import {Rational} from "./rational"

import {RecipeRowData} from './state'


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

    addRow(row: RecipeRowData) {
        let effects = {
            consumption: Rational.one,
            pollution: Rational.one,
            productivity: Rational.one,
            speed: Rational.one,
        }

        for (let module of row.modules) {
            if (!module) continue
            effects.consumption = effects.consumption.add(module.effects.consumption)
            effects.pollution = effects.pollution.add(module.effects.pollution)
            effects.productivity = effects.productivity.add(module.effects.productivity)
            effects.speed = effects.speed.add(module.effects.speed)
        }

        if (row.beaconModule && row.numBeacons > 0) {
            // TODO: export and use "distribution_effectivity" from beacon entities
            // assume the common value of 0.5 for now

            let be = row.beaconModule.effects;
            let num = Rational.fromInts(row.numBeacons, 2);
            effects.consumption = effects.consumption.add(be.consumption.mul(num))
            effects.pollution = effects.pollution.add(be.pollution.mul(num))
            effects.productivity = effects.productivity.add(be.productivity.mul(num))
            effects.speed = effects.speed.add(be.speed.mul(num))
        }

        // Allowed -80% to de facto max of signed short int
        effects.consumption = effects.consumption.clamp(.2, 32767)
        effects.pollution = effects.pollution.clamp(.2, 32767)
        effects.speed = effects.speed.clamp(.2, 32767)

        // Special minimum: -0%
        effects.productivity = effects.productivity.clamp(1, 32767)

        let ingredientMult = Rational.one
            .mul(row.recipe.crafting_time.invert())
            .mul(row.numMachines)
            .mul(row.machine.data.crafting_speed)
            .mul(effects.speed)

        let productMult = ingredientMult.mul(effects.productivity)

        row.recipe.ingredients
            .map((ingredient) => {
                ingredient = clone(ingredient)
                ingredient.amount = ingredient.amount.mul(ingredientMult)
                return ingredient
            })
            .forEach(this.addIngredient)

        row.recipe.products
            .map((product) => {
                product = clone(product)
                product.amount = product.amount.mul(productMult)
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
