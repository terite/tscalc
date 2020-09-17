import * as game from './game';

import { clone } from './util';

import { Rational } from './rational';

import { RecipeRowData } from './state';

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

  addIngredient(ingredient: game.Ingredient): void {
    for (const oldIng of this.ingredients) {
      let match =
        ingredient.type === oldIng.type && ingredient.item === oldIng.item;
      if (ingredient.type === 'fluid' && oldIng.type === 'fluid') {
        match =
          match &&
          ingredient.maximum_temperature === oldIng.maximum_temperature &&
          ingredient.minimum_temperature === oldIng.minimum_temperature;
      }

      if (match) {
        oldIng.amount = oldIng.amount.add(ingredient.amount);
        return;
      }
    }
    this.ingredients.push(ingredient);
  }

  addProduct(product: game.Product): void {
    for (const oldProd of this.products) {
      let match =
        product.type === oldProd.type && product.item === oldProd.item;
      if (product.type === 'fluid' && oldProd.type === 'fluid') {
        match = match && product.temperature === oldProd.temperature;
      }

      if (match) {
        oldProd.amount = oldProd.amount.add(product.amount);
        return;
      }
    }
    this.products.push(product);
  }

  addRow(row: RecipeRowData): void {
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
      .mul(row.recipe.crafting_time.invert())
      .mul(row.numMachines)
      .mul(row.machine.data.crafting_speed)
      .mul(effects.speed);

    const productMult = ingredientMult.mul(effects.productivity);

    for (const ingredient of row.recipe.ingredients.map((ingredient) => {
      ingredient = clone(ingredient);
      ingredient.amount = ingredient.amount.mul(ingredientMult);
      return ingredient;
    })) {
      this.addIngredient(ingredient);
    }

    for (const product of row.recipe.products.map((product) => {
      product = clone(product);
      product.amount = product.amount.mul(productMult);
      return product;
    })) {
      this.addProduct(product);
    }
  }

  reduce(): {
    ingredients: game.Ingredient[];
    products: game.Product[];
  } {
    let ingredients = this.ingredients.map(clone);
    let products = this.products.map(clone);

    for (const product of products) {
      for (const ingredient of ingredients) {
        if (product.amount.isZero() || ingredient.amount.isZero()) {
          continue;
        }
        if (!product.satisfies(ingredient)) {
          continue;
        }
        if (product.amount.less(ingredient.amount)) {
          // More ingredient than product
          ingredient.amount = ingredient.amount.sub(product.amount);
          product.amount = Rational.zero;
        } else if (ingredient.amount.less(product.amount)) {
          // More product than ingredient
          product.amount = product.amount.sub(ingredient.amount);
          ingredient.amount = Rational.zero;
        } else {
          ingredient.amount = Rational.zero;
          product.amount = Rational.zero;
        }
      }
    }

    ingredients = ingredients.filter((i) => !i.amount.isZero());
    products = products.filter((p) => !p.amount.isZero());

    return { ingredients, products };
  }
}
