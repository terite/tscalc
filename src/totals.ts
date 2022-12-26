import * as game from './game';

import { clone } from './util';

import { Rational } from './rational';

import { RecipeRowData } from './state';


export function calculateRates(row: RecipeRowData): [game.Ingredient[], game.Product[]] {
  const effects = {
    consumption: Rational.one,
    pollution: Rational.one,
    productivity: Rational.one,
    speed: Rational.one,
  };

  for (const module of row.modules) {
    if (!module) continue;
    effects.consumption = effects.consumption.add(module.effects.consumption);
    effects.pollution = effects.pollution.add(module.effects.pollution);
    effects.productivity = effects.productivity.add(
      module.effects.productivity
    );
    effects.speed = effects.speed.add(module.effects.speed);
  }

  if (row.beaconModule && row.numBeacons > 0) {
    // assumes "distribution_effectivity" of 0.5 from default beacons
    const be = row.beaconModule.effects;
    const num = Rational.fromInts(row.numBeacons, 2);
    effects.consumption = effects.consumption.add(be.consumption.mul(num));
    effects.pollution = effects.pollution.add(be.pollution.mul(num));
    effects.productivity = effects.productivity.add(be.productivity.mul(num));
    effects.speed = effects.speed.add(be.speed.mul(num));
  }

  // Allowed -80% to de facto max of signed short int
  effects.consumption = effects.consumption.clamp(0.2, 32767);
  effects.pollution = effects.pollution.clamp(0.2, 32767);
  effects.speed = effects.speed.clamp(0.2, 32767);

  // Special minimum: -0%
  effects.productivity = effects.productivity.clamp(1, 32767);

  const ingredientMult = Rational.one
    .mul(row.recipe.craftingTime.invert())
    .mul(row.numMachines)
    .mul(row.machine.craftingSpeed)
    .mul(effects.speed);

  const productMult = ingredientMult.mul(effects.productivity);

  const outIngredients: game.Ingredient[] = [];
  for (let ingredient of row.recipe.ingredients) {
    ingredient = clone(ingredient);
    ingredient.amount = ingredient.amount.mul(ingredientMult);
    outIngredients.push(ingredient);
  }

  const outProducts: game.Product[] = [];
  for (let product of row.recipe.products) {
    product = clone(product);
    product.amount = product.amount.mul(productMult);
    outProducts.push(product);
  }

  return [outIngredients, outProducts];
}

export class Totals {
  ingredients: game.Ingredient[] = [];
  products: game.Product[] = [];

  constructor(rows?: RecipeRowData[]) {
    if (rows && rows.length) {
      for (const row of rows) {
        this.addRow(row);
      }
    }
  }

  addIngredient(newIngredient: game.Ingredient): void {
    for (const oldIng of this.ingredients) {
      if (oldIng.name !== newIngredient.name) {
        continue;
      }
      if (
        newIngredient instanceof game.FluidIngredient &&
        oldIng instanceof game.FluidIngredient
      ) {
        if (
          newIngredient.maximumTemperature !== oldIng.maximumTemperature ||
          newIngredient.minimumTemperature !== oldIng.minimumTemperature
        ) {
          continue;
        }
      }

      oldIng.amount = oldIng.amount.add(newIngredient.amount);
      return;
    }

    for (const oldProd of this.products) {
      if (!oldProd.satisfies(newIngredient)) continue;
      if (oldProd.amount.less(newIngredient.amount)) {
        newIngredient.amount = newIngredient.amount.sub(oldProd.amount);
        oldProd.amount = Rational.zero;
        if (newIngredient.amount.isZero()) break;
      } else {
        oldProd.amount = oldProd.amount.sub(newIngredient.amount);
        newIngredient.amount = Rational.zero;
        break;
      }
    }

    this.ingredients.push(newIngredient);
    this.ingredients = this.ingredients.filter((p) => !p.amount.isZero());
    this.products = this.products.filter((p) => !p.amount.isZero());
  }

  addProduct(newProduct: game.Product): void {
    for (const oldProd of this.products) {
      if (newProduct.name !== oldProd.name) continue;

      if (
        newProduct instanceof game.FluidProduct &&
        oldProd instanceof game.FluidProduct
      ) {
        if (newProduct.temperature !== oldProd.temperature) {
          continue;
        }
      }

      oldProd.amount = oldProd.amount.add(newProduct.amount);
      return;
    }

    for (const oldIng of this.ingredients) {
      if (!newProduct.satisfies(oldIng)) continue;
      if (newProduct.amount.less(oldIng.amount)) {
        oldIng.amount = oldIng.amount.sub(newProduct.amount);
        newProduct.amount = Rational.zero;
        break;
      } else {
        newProduct.amount = newProduct.amount.sub(oldIng.amount);
        oldIng.amount = Rational.zero;
        if (newProduct.amount.isZero()) break;
      }
    }

    this.products.push(newProduct);
    this.ingredients = this.ingredients.filter((i) => !i.amount.isZero());
    this.products = this.products.filter((i) => !i.amount.isZero());
  }

  addRow(row: RecipeRowData): void {
    const [ingredients, products] = calculateRates(row);
    for (const ingredient of ingredients) {
      this.addIngredient(ingredient);
    }
    for (const product of products) {
      this.addProduct(product);
    }
  }
}
