import { Rational } from './rational';
import { assert, values } from './util';

import * as schema from './schema';

type LocalisedName = schema.LocalisedName;

interface IBaseDisplayable {
  name: string;
  localised_name: LocalisedName;
  icon_col: number;
  icon_row: number;
}

export class BaseDisplayable {
  name: string;
  localised_name: LocalisedName;
  icon_col: number;
  icon_row: number;

  constructor(data: IBaseDisplayable) {
    this.name = data.name;
    this.localised_name = data.localised_name;
    this.icon_col = data.icon_col;
    this.icon_row = data.icon_row;
  }

  niceName() {
    return this.localised_name.en;
  }
}

abstract class BaseItem<T extends schema.Item> extends BaseDisplayable {
  raw: T;
  usedBy: Recipe[] = [];
  madeBy: Recipe[] = [];

  constructor(d: T) {
    super(d);
    this.raw = d;
    this.name = d.name;
    this.localised_name = d.localised_name;
    this.icon_col = d.icon_col;
    this.icon_row = d.icon_row;
  }
}

export class Module extends BaseItem<schema.ModuleItem> {
  type: 'module';
  limitedTo: Set<string>;
  effects: {
    speed: Rational;
    productivity: Rational;
    consumption: Rational;
    pollution: Rational;
  };

  constructor(d: schema.ModuleItem) {
    super(d);
    this.type = d.type;
    this.limitedTo = new Set(d.limitation);

    this.effects = {
      speed: Rational.fromFloat((d.effect.speed || { bonus: 0 }).bonus),
      productivity: Rational.fromFloat(
        (d.effect.productivity || { bonus: 0 }).bonus
      ),
      consumption: Rational.fromFloat(
        (d.effect.consumption || { bonus: 0 }).bonus
      ),
      pollution: Rational.fromFloat((d.effect.pollution || { bonus: 0 }).bonus),
    };
  }

  canUseWith(recipe: Recipe) {
    if (this.limitedTo.size === 0) {
      return true;
    }

    return this.limitedTo.has(recipe.name);
  }
}

class GenericItem extends BaseItem<schema.Item> {
  type: 'generic' = 'generic';
}

export type Item = Module | GenericItem;

export class Fluid extends BaseItem<schema.FluidItem> {
  default_temperature: number;
  type: 'fluid' = 'fluid';

  constructor(d: schema.FluidItem) {
    super(d);
    this.default_temperature = d.default_temperature;
  }
}

abstract class BaseIngredient {
  name: string;
  amount: Rational;

  constructor(d: schema.Ingredient) {
    this.name = d.name;
    this.amount = Rational.fromFloat(d.amount);
  }
}

export class ItemIngredient extends BaseIngredient {
  type: 'item' = 'item';
  item: Item;

  constructor(d: schema.Ingredient, gd: GameData) {
    super(d);
    this.item = gd.itemMap[d.name];
  }

  niceName() {
    return `${this.amount.toDecimal()} × ${this.item.niceName()}`;
  }
}

export class FluidIngredient extends BaseIngredient {
  type: 'fluid' = 'fluid';
  item: Fluid;
  minimum_temperature: number;
  maximum_temperature: number;

  constructor(d: schema.Ingredient, gd: GameData) {
    super(d);
    this.item = gd.fluidMap[d.name];

    this.minimum_temperature = d.minimum_temperature || -Infinity;
    this.maximum_temperature = d.maximum_temperature || Infinity;

    if (this.maximum_temperature >= 1.797e308) {
      this.maximum_temperature = Infinity;
    }
    if (this.minimum_temperature <= -1.797e308) {
      this.minimum_temperature = -Infinity;
    }
  }

  niceName() {
    const min = this.minimum_temperature;
    const max = this.maximum_temperature;
    let range = '';
    if (min !== -Infinity && max !== Infinity) {
      range = ` (${min}° – ${max}°)`;
    } else if (max !== Infinity) {
      range = ` (≤ ${max}°)`;
    } else if (min !== -Infinity) {
      range = ` (≥ ${max}°)`;
    }
    return `${this.amount.toDecimal()} × ${this.item.niceName()}${range}`;
  }
}

export type Ingredient = ItemIngredient | FluidIngredient;

abstract class BaseProduct {
  name: string;
  amount: Rational;

  constructor(d: schema.Product) {
    this.name = d.name;

    let amount;
    if ('amount' in d) {
      amount = Rational.fromFloat(d.amount);
    } else {
      amount = Rational.fromInts(d.amount_min + d.amount_max, 2);
    }

    if (typeof d.probability == 'number') {
      if (d.probability === 0) {
        amount = Rational.zero;
      } else if (d.probability !== 1) {
        assert(d.probability > 0);
        assert(d.probability < 1);
        amount = amount.mul(Rational.fromFloat(d.probability));
      }
    }
    this.amount = amount;
  }
}

export class ItemProduct extends BaseProduct {
  type: 'item' = 'item';
  item: Item;

  constructor(d: schema.Product, gd: GameData) {
    super(d);
    this.item = gd.itemMap[d.name];
  }

  niceName() {
    return `${this.amount.toDecimal()} × ${this.item.niceName()}`;
  }

  satisfies(ingredient: Ingredient) {
    return ingredient.type === 'item' && ingredient.item === this.item;
  }
}

export class FluidProduct extends BaseProduct {
  type: 'fluid' = 'fluid';
  item: Fluid;
  temperature: number;

  constructor(d: schema.Product, gd: GameData) {
    super(d);
    this.item = gd.fluidMap[d.name];
    if (!this.item) {
      console.error('could not find item', d);
    }
    this.temperature = d.temperature || this.item.default_temperature;
  }

  niceName() {
    let temp = '';
    if (this.temperature !== this.item.default_temperature) {
      temp = ` (${this.temperature}°)`;
    }
    return `${this.amount.toDecimal()} × ${this.item.niceName()}${temp}`;
  }

  satisfies(ingredient: Ingredient) {
    return (
      ingredient.type === 'fluid' &&
      ingredient.item === this.item &&
      ingredient.maximum_temperature >= this.temperature &&
      ingredient.minimum_temperature <= this.temperature
    );
  }
}

export type Product = ItemProduct | FluidProduct;

export class Recipe extends BaseDisplayable {
  category: string;
  ingredients: Ingredient[];
  products: Product[];
  crafting_time: Rational;

  madeIn: AssemblingMachine[] = [];

  constructor(d: schema.Recipe, gd: GameData) {
    super(d);
    this.name = d.name;
    this.category = d.category;
    this.crafting_time = Rational.fromFloat(d.energy_required);

    this.ingredients = d.ingredients.map((ingredient) => {
      if (ingredient.type === 'fluid') {
        return new FluidIngredient(ingredient, gd);
      } else {
        return new ItemIngredient(ingredient, gd);
      }
    });

    this.products = d.results.map((result) => {
      if (result.type === 'fluid') {
        return new FluidProduct(result, gd);
      } else {
        return new ItemProduct(result, gd);
      }
    });
  }

  niceName() {
    if (this.products.length > 1) {
      return super.niceName();
    } else if (this.products[0].amount.equal(Rational.one)) {
      return this.products[0].item.niceName();
    } else {
      return this.products[0].niceName();
    }
  }
}

export abstract class BaseEntity<T extends schema.BaseEntity> {
  data: T;
  constructor(data: T) {
    this.data = data;
  }

  niceName() {
    return this.data.localised_name.en;
  }
}

export class AssemblingMachine extends BaseEntity<schema.AssemblingMachine> {
  canBuildRecipe(recipe: Recipe) {
    // TODO: this needs to account for entity fluid boxes
    if (this.data.crafting_categories.indexOf(recipe.category) === -1) {
      return false;
    }

    // ingredient_count seems to be item specific. this is disabled until
    // I can figure out how many fluids a machine can support
    // if (recipe.ingredients.length > this.data.ingredient_count) {
    //     return false
    // }
    return true;
  }
}

export type Entity = AssemblingMachine;

type CategoryMap = { [category: string]: AssemblingMachine[] };

const createCategoryMap = (entities: Entity[]) => {
  const catMap: CategoryMap = {};
  for (let entity of entities) {
    if (!(entity instanceof AssemblingMachine)) {
    }
    for (let category of entity.data.crafting_categories) {
      if (!catMap.hasOwnProperty(category)) {
        catMap[category] = [];
      }
      catMap[category].push(entity);
    }
  }
  return catMap;
};

export class GameData {
  raw: schema.Root;

  items: Item[] = [];
  itemMap: { [name: string]: Item } = {};

  fluids: Fluid[] = [];
  fluidMap: { [name: string]: Fluid } = {};

  modules: Module[] = [];
  moduleMap: { [name: string]: Module } = {};

  recipes: Recipe[] = [];
  recipeMap: { [name: string]: Recipe } = {};

  entities: Entity[] = [];
  entityMap: { [name: string]: Entity } = {};

  categoryMap: CategoryMap;

  constructor(raw: schema.Root) {
    console.groupCollapsed('Game data processing');
    this.raw = raw;

    type Thing<T> = {
      new (d: T): Entity;
    };

    const addOfType = <S extends schema.BaseEntity, C extends Thing<S>>(
      entities: S[],
      ctor: C
    ) => {
      for (let edata of entities) {
        const entity = new ctor(edata);
        this.entityMap[edata.name] = entity;
        this.entities.push(entity);
      }
    };

    addOfType(values(raw['assembling-machine']), AssemblingMachine);
    addOfType(values(raw['furnace']), AssemblingMachine);
    addOfType(values(raw['rocket-silo']), AssemblingMachine);

    for (let itemName in raw.items) {
      const thing = raw.items[itemName];
      if ('type' in thing && thing.type === 'fluid') {
        const fluid = new Fluid(thing);
        this.fluids.push(fluid);
        this.fluidMap[fluid.name] = fluid;
      } else if ('type' in thing && thing.type === 'module') {
        const item = new Module(thing);
        this.items.push(item);
        this.itemMap[item.name] = item;
        this.modules.push(item);
        this.moduleMap[item.name] = item;
      } else {
        const item = new GenericItem(thing);
        this.items.push(item);
        this.itemMap[item.name] = item;
      }
    }

    for (let recipeName in raw.recipes) {
      const recipe = new Recipe(raw.recipes[recipeName], this);

      for (let entityName in this.entityMap) {
        const entity = this.entityMap[entityName];

        if ('canBuildRecipe' in entity && entity.canBuildRecipe(recipe)) {
          recipe.madeIn.push(entity);
        }
      }
      if (!recipe.madeIn.length) {
        // Filter to only recipes buildable by knonwn assembling machines
        console.warn('Ignoring uncraftable recipe', recipe.name, recipe);
        continue;
      }

      const hasProducts = recipe.products.some((p) => p.amount.isPositive());
      if (!hasProducts) {
        console.debug('Ignoring void recipe', recipe.name, recipe);
        continue;
      }

      this.recipeMap[recipe.name] = recipe;
      this.recipes.push(recipe);

      for (let ingredient of recipe.ingredients) {
        ingredient.item.usedBy.push(recipe);
      }
      for (let product of recipe.products) {
        product.item.madeBy.push(recipe);
      }
    }

    this.categoryMap = createCategoryMap(this.entities);
    console.log(`Processed ${this.items.length} items`);
    console.log(`Processed ${this.fluids.length} fluids`);
    console.log(`Processed ${this.recipes.length} recipes`);
    console.log(`Processed ${this.entities.length} entities`);
    console.groupEnd();
  }

  getItemOrder(item: Item | Fluid) {
    let groupOrder = '';
    let subgroupOrder = '';
    const group = this.raw.groups[item.raw.group];
    if (group) {
      groupOrder = group.order;
      subgroupOrder = group.subgroups[item.raw.subgroup] || '';
    }
    return [groupOrder, subgroupOrder, item.raw.order, item.raw.name];
  }

  // Sort by
  // 1. group
  // 2. subgroup
  // 3. item order string
  // 4. item name
  sortByItem<T>(collection: T[], keyFn: (obj: T) => Item | Fluid): void {
    const sortFn = (a: T, b: T) => {
      const ordersA = this.getItemOrder(keyFn(a));
      const ordersB = this.getItemOrder(keyFn(b));

      for (const i in ordersA) {
        const valA = ordersA[i];
        const valB = ordersB[i];
        if (valA > valB) {
          return 1;
        } else if (valA < valB) {
          return -1;
        }
      }

      return 0;
    };

    collection.sort(sortFn);
  }
}
