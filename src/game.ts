import { Rational } from './rational';
import { assert } from './util';

import * as schema from './schema';

interface IBaseDisplayable {
  name: string;
  localised_name: schema.LocalisedName;
  icon_col: number;
  icon_row: number;
}

export class BaseDisplayable {
  readonly name: string;
  readonly localisedName: schema.LocalisedName;
  readonly iconCol: number;
  readonly iconRow: number;

  constructor(data: IBaseDisplayable) {
    this.name = data.name;
    this.localisedName = data.localised_name;
    this.iconCol = data.icon_col;
    this.iconRow = data.icon_row;
  }

  get niceName(): string {
    return this.localisedName.en;
  }
}

export class Item extends BaseDisplayable {
  readonly group: string;
  readonly subgroup: string;
  readonly order: string;
  readonly fuelValue: number | null;

  readonly usedBy: Recipe[] = [];
  readonly madeBy: Recipe[] = [];

  constructor(d: schema.Item) {
    super(d);

    this.group = d.group;
    this.subgroup = d.subgroup;
    this.order = d.order;
    this.fuelValue = d.fuel_value ?? null;
  }
}

export class Module extends Item {
  readonly type: 'module';
  readonly limitedTo: Set<string>;
  readonly effects: {
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

  canUseWith(recipe: Recipe): boolean {
    if (this.limitedTo.size === 0) {
      return true;
    }

    return this.limitedTo.has(recipe.name);
  }
}

export class Fluid extends Item {
  readonly defaultTemperature: number;
  readonly type: 'fluid' = 'fluid';

  constructor(d: schema.FluidItem) {
    super(d);
    this.defaultTemperature = d.default_temperature;
  }
}

export class Ingredient {
  readonly type: 'item' | 'fluid';
  readonly name: string;
  amount: Rational; // TODO: readonly
  readonly item: Item;

  constructor(d: schema.Ingredient, gd: GameData) {
    this.name = d.name;
    this.amount = Rational.fromFloat(d.amount);
    this.type = d.type ?? 'item';
    this.item = gd.getItem(d.name);
  }

  get niceName(): string {
    return `${this.amount.toDecimal()} × ${this.item.niceName}`;
  }
}

export class FluidIngredient extends Ingredient {
  readonly type: 'fluid' = 'fluid';
  readonly item: Fluid;
  readonly minimumTemperature: number;
  readonly maximumTemperature: number;

  constructor(d: schema.Ingredient, gd: GameData) {
    super(d, gd);
    this.item = gd.getFluid(d.name);

    this.minimumTemperature = d.minimum_temperature || -Infinity;
    this.maximumTemperature = d.maximum_temperature || Infinity;

    if (this.maximumTemperature >= 1.797e308) {
      this.maximumTemperature = Infinity;
    }
    if (this.minimumTemperature <= -1.797e308) {
      this.minimumTemperature = -Infinity;
    }
  }

  get niceName(): string {
    const min = this.minimumTemperature;
    const max = this.maximumTemperature;
    let range = '';
    if (min !== -Infinity && max !== Infinity) {
      range = ` (${min}° – ${max}°)`;
    } else if (max !== Infinity) {
      range = ` (≤ ${max}°)`;
    } else if (min !== -Infinity) {
      range = ` (≥ ${max}°)`;
    }
    return `${this.amount.toDecimal()} × ${this.item.niceName}${range}`;
  }
}

export class Product {
  readonly name: string;
  readonly item: Item;
  amount: Rational;

  constructor(d: schema.Product, gd: GameData) {
    this.name = d.name;
    this.item = gd.getItem(d.name);

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

  get niceName(): string {
    return `${this.amount.toDecimal()} × ${this.item.niceName}`;
  }

  satisfies(ingredient: Ingredient): boolean {
    return ingredient.item === this.item;
  }
}

export class FluidProduct extends Product {
  readonly item: Fluid;
  readonly temperature: number;

  constructor(d: schema.Product, gd: GameData) {
    super(d, gd);
    this.item = gd.getFluid(d.name);
    this.temperature = d.temperature || this.item.defaultTemperature;
  }

  get niceName(): string {
    let temp = '';
    if (this.temperature !== this.item.defaultTemperature) {
      temp = ` (${this.temperature}°)`;
    }
    return `${this.amount.toDecimal()} × ${this.item.niceName}${temp}`;
  }

  satisfies(ingredient: Ingredient): boolean {
    return (
      ingredient.item === this.item &&
      ingredient instanceof FluidIngredient &&
      ingredient.maximumTemperature >= this.temperature &&
      ingredient.minimumTemperature <= this.temperature
    );
  }
}

export class Recipe extends BaseDisplayable {
  readonly category: string;
  readonly ingredients: Ingredient[];
  readonly products: Product[];
  readonly craftingTime: Rational;

  readonly madeIn: AssemblingMachine[] = [];

  constructor(d: schema.Recipe, gd: GameData) {
    super(d);
    this.category = d.category;
    this.craftingTime = Rational.fromFloat(d.energy_required);

    this.ingredients = d.ingredients.map((ingredient) => {
      if (ingredient.type === 'fluid') {
        return new FluidIngredient(ingredient, gd);
      } else {
        return new Ingredient(ingredient, gd);
      }
    });

    this.products = d.results.map((result) => {
      if (result.type === 'fluid') {
        return new FluidProduct(result, gd);
      } else {
        return new Product(result, gd);
      }
    });
  }

  get niceName(): string {
    if (this.products.length !== 1) {
      return super.niceName;
    }
    const product = this.products[0];
    assert(product, 'recipe has no products');
    if (product.amount.equal(Rational.one)) {
      return product.item.niceName;
    } else {
      return product.niceName;
    }
  }
}

export abstract class BaseEntity extends BaseDisplayable {
  // constructor exists to constrain type
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(data: schema.BaseEntity) {
    super(data);
  }
}

export class AssemblingMachine extends BaseEntity {
  readonly craftingCategories: string[];
  readonly craftingSpeed: number;
  readonly moduleSlots: number;

  constructor(data: schema.AssemblingMachine) {
    super(data);
    this.craftingCategories = data.crafting_categories;
    this.craftingSpeed = data.crafting_speed;
    this.moduleSlots = data.module_slots;
  }

  canBuildRecipe(recipe: Recipe): boolean {
    // TODO: this needs to account for entity fluid boxes
    if (this.craftingCategories.indexOf(recipe.category) === -1) {
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

const createCategoryMap = (entities: Iterable<Entity>): CategoryMap => {
  const catMap: CategoryMap = {};
  for (const entity of entities) {
    for (const category of entity.craftingCategories) {
      const machines = catMap[category];
      if (machines) {
        machines.push(entity);
      } else {
        catMap[category] = [entity];
      }
    }
  }
  return catMap;
};

export class GameData {
  readonly itemMap = new Map<string, Item>();

  readonly fluids: Fluid[] = [];
  readonly fluidMap = new Map<string, Fluid>();

  readonly modules: Module[] = [];
  readonly moduleMap = new Map<string, Module>();

  readonly recipes: Recipe[] = [];
  readonly recipeMap = new Map<string, Recipe>();

  readonly entityMap = new Map<string, Entity>();

  readonly categoryMap: CategoryMap;
  readonly groups: schema.Groups;

  readonly clockSprite: BaseDisplayable;
  readonly noModuleModule: Module;

  readonly spriteHash: string;

  constructor(raw: schema.Root) {
    this.spriteHash = raw.sprites.hash;

    for (const edata of Object.values(raw['assembling-machine'])) {
      const entity = new AssemblingMachine(edata);
      this.entityMap.set(entity.name, entity);
    }

    for (const edata of Object.values(raw['furnace'])) {
      const entity = new AssemblingMachine(edata);
      this.entityMap.set(entity.name, entity);
    }

    for (const edata of Object.values(raw['rocket-silo'])) {
      const entity = new AssemblingMachine(edata);
      this.entityMap.set(entity.name, entity);
    }

    for (const rawMiningDrill of Object.values(raw['mining-drill'])) {
      const rawMachine: schema.AssemblingMachine = {
        ...rawMiningDrill,
        crafting_categories: rawMiningDrill.resource_categories.map(
          (r) => 'resource-' + r
        ),
        crafting_speed: rawMiningDrill.mining_speed,
        ingredient_count: 1,
      };
      const machine = new AssemblingMachine(rawMachine);
      this.entityMap.set(rawMachine.name, machine);
    }

    for (const rawItem of Object.values(raw.items)) {
      if ('type' in rawItem && rawItem.type === 'fluid') {
        const fluid = new Fluid(rawItem);
        this.itemMap.set(fluid.name, fluid);
        this.fluids.push(fluid);
        this.fluidMap.set(fluid.name, fluid);
      } else if ('type' in rawItem && rawItem.type === 'module') {
        const item = new Module(rawItem);
        this.itemMap.set(item.name, item);
        this.modules.push(item);
        this.moduleMap.set(item.name, item);
      } else {
        const item = new Item(rawItem);
        this.itemMap.set(item.name, item);
      }
    }

    const recipes: Recipe[] = [];

    // Add real recipes
    for (const rawRecipe of Object.values(raw.recipes)) {
      recipes.push(new Recipe(rawRecipe, this));
    }

    // Add fake recipes for resources
    for (const rawResource of Object.values(raw.resource)) {
      const category = `resource-${rawResource.category}`;
      const ingredients: schema.Ingredient[] = [];
      const { fluid_amount, required_fluid } = rawResource.minable;
      if (fluid_amount && required_fluid) {
        ingredients.push({
          name: required_fluid,
          type: 'fluid',
          // 10 in lua becomes 1 in game. not sure why
          amount: fluid_amount / 10,
        });
      }
      recipes.push(
        new Recipe(
          {
            name: `resource-${rawResource.name}`,
            localised_name: rawResource.localised_name,
            category,
            energy_required: rawResource.minable.mining_time,
            group: category, // TODO: better group?
            subgroup: category, // TODO: better subgroup?
            icon_col: rawResource.icon_col,
            icon_row: rawResource.icon_row,
            ingredients,
            results: rawResource.minable.results,
            type: 'recipe',
            order: 'A',
          },
          this
        )
      );
    }

    for (const recipe of recipes) {
      for (const entity of this.entityMap.values()) {
        if ('canBuildRecipe' in entity && entity.canBuildRecipe(recipe)) {
          recipe.madeIn.push(entity);
        }
      }
      if (!recipe.madeIn.length) {
        // Filter to only recipes buildable by knonwn assembling machines
        console.warn(`Ignoring uncraftable recipe: ${recipe.name}`);
        continue;
      }

      const hasProducts = recipe.products.some((p) => p.amount.isPositive());
      if (!hasProducts) {
        continue;
      }

      for (const ingredient of recipe.ingredients) {
        ingredient.item.usedBy.push(recipe);
      }
      for (const product of recipe.products) {
        product.item.madeBy.push(recipe);
      }
      this.recipes.push(recipe);
      this.recipeMap.set(recipe.name, recipe);
    }

    this.categoryMap = createCategoryMap(this.entityMap.values());
    this.groups = raw.groups;

    const clockSprite = raw.sprites.extra['clock'];
    assert(clockSprite, 'missing clock sprite');
    const noModuleIcon = raw.sprites.extra['slot_icon_module'];
    assert(noModuleIcon, 'missing "no icon" sprite');

    this.clockSprite = new BaseDisplayable({
      ...clockSprite,
      name: 'clock',
      localised_name: { en: 'Clock' },
    });

    this.noModuleModule = new Module({
      ...noModuleIcon,
      type: 'module',
      name: 'no_module',
      localised_name: { en: 'No Module' },
      category: 'speed',
      effect: {},
      limitation: [],
      rocket_launch_products: [],

      group: '',
      subgroup: '',
      order: '',
    });
  }

  getEntity(name: string): Entity {
    const entity = this.entityMap.get(name);
    assert(entity, `no entity with name: ${name}`);
    return entity;
  }

  getFluid(name: string): Fluid {
    const fluid = this.fluidMap.get(name);
    assert(fluid, `no fluid with name: ${name}`);
    return fluid;
  }

  getItem(name: string): Item {
    const item = this.itemMap.get(name);
    assert(item, `no item with name: ${name}`);
    return item;
  }

  getModule(name: string): Module {
    const module = this.moduleMap.get(name);
    assert(module, `no module with name: ${name}`);
    return module;
  }

  getRecipe(name: string): Recipe {
    const recipe = this.recipeMap.get(name);
    assert(recipe, `no recipe with name: ${name}`);
    return recipe;
  }

  getItemOrder(item: Item | Fluid): [string, string, string, string] {
    let groupOrder = '';
    let subgroupOrder = '';
    const group = this.groups[item.group];
    if (group) {
      groupOrder = group.order;
      subgroupOrder = group.subgroups[item.subgroup] || '';
    }
    return [groupOrder, subgroupOrder, item.order, item.name];
  }

  // Sort by
  // 1. group
  // 2. subgroup
  // 3. item order string
  // 4. item name
  sortByItem<T>(collection: T[], keyFn: (obj: T) => Item | Fluid): void {
    collection.sort((a: T, b: T) => {
      const ordersA = this.getItemOrder(keyFn(a));
      const ordersB = this.getItemOrder(keyFn(b));

      for (const i in ordersA) {
        const valA = ordersA[i]!;
        const valB = ordersB[i]!;
        if (valA > valB) {
          return 1;
        } else if (valA < valB) {
          return -1;
        }
      }

      return 0;
    });
  }
}
