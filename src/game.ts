
import {Rational} from "./rational"
import {assert, values} from "./util"

import * as schema from "./schema"

type LocalisedName = schema.LocalisedName


interface IBaseDisplayable {
    name: string;
    localised_name: LocalisedName;
    icon_col: number;
    icon_row: number;
}

export class BaseDisplayable implements IBaseDisplayable {
    name: string;
    localised_name: LocalisedName;
    icon_col: number;
    icon_row: number;

    constructor(data: IBaseDisplayable) {
        this.name = data.name;
        this.localised_name = data.localised_name
        this.icon_col = data.icon_col
        this.icon_row = data.icon_row
    }

    niceName() {
        return this.localised_name.en;
    }
}

export class BaseItem extends BaseDisplayable {
    usedBy: Recipe[] = [];
    madeBy: Recipe[] = [];

    constructor(d: schema.Item) {
        super(d);
        this.name = d.name;
        this.localised_name = d.localised_name
        this.icon_col = d.icon_col;
        this.icon_row = d.icon_row;
    }
}

export class Item extends BaseItem {
    // TODO: figure out type
    type: "item" = "item"
}

export class Fluid extends BaseItem {
    default_temperature: number
    type: "fluid" = "fluid"

    constructor(d: schema.FluidItem) {
        super(d)
        this.default_temperature = d.default_temperature
    }
}

abstract class BaseIngredient {
    name: string;
    amount: Rational
    
    constructor(d: schema.Ingredient) {
        this.name = d.name
        this.amount = Rational.fromFloat(d.amount)
    }
}

export class ItemIngredient extends BaseIngredient {
    type: "item" = "item"
    item: Item

    constructor(d: schema.Ingredient, gd: GameData) {
        super(d)
        this.item = gd.itemMap[d.name]
    }
}

export class FluidIngredient extends BaseIngredient {
    type: "fluid" = "fluid"
    item: Fluid
    minimum_temperature: number
    maximum_temperature: number

    constructor(d: schema.Ingredient, gd: GameData) {
        super(d)
        this.item = gd.fluidMap[d.name]
        this.minimum_temperature = d.minimum_temperature || -Infinity
        this.maximum_temperature = d.maximum_temperature || Infinity
    }
}

export type Ingredient = ItemIngredient | FluidIngredient

abstract class BaseProduct {
    name: string
    amount: Rational

    constructor(d: schema.Product) {
        this.name = d.name

        let amount;
        if ('amount' in d) {
            amount = Rational.fromFloat(d.amount)
        } else {
            amount = Rational.fromInts(d.amount_min + d.amount_max, 2)
        }

        if (d.probability && d.probability != 1) {
            assert(d.probability > 0)
            assert(d.probability < 1)
            amount = amount.mul(Rational.fromFloat(d.probability))
        }
        this.amount = amount;
    }
}

export class ItemProduct extends BaseProduct {
    type: "item" = "item"
    item: Item

    constructor(d: schema.Product, gd: GameData) {
        super(d)
        this.item = gd.itemMap[d.name]
    }
}

export class FluidProduct extends BaseProduct {
    type: "fluid" = "fluid"
    item: Fluid
    temperature: number;

    constructor(d: schema.Product, gd: GameData) {
        super(d)
        this.item = gd.fluidMap[d.name]
        if (!this.item) {
            console.log("no item", d)
            debugger
        }
        this.temperature = d.temperature || this.item.default_temperature || 15
    }
}

export type Product = ItemProduct | FluidProduct

export class Recipe extends BaseDisplayable {
    category: string;
    ingredients: Ingredient[];
    products: Product[];
    crafting_time: Rational;
    default_machine = Entity.AssemblingMachine

    constructor(d: schema.Recipe, gd: GameData) {
        super(d)
        this.name = d.name;
        this.category = d.category;
        this.crafting_time = Rational.fromFloat(d.energy_required);

        this.ingredients = d.ingredients.map((ingredient) => {
            if (ingredient.type == "fluid") {
                return new FluidIngredient(ingredient, gd); 
            } else {
                return new ItemIngredient(ingredient, gd); 
            }
        });

        this.products = d.results.map((result) => {
            if (result.type == "fluid") {
                return new FluidProduct(result, gd); 
            } else {
                return new ItemProduct(result, gd); 
            }
        });
    }
}

export namespace Entity {
    abstract class BaseEntity<T> {
        data: T
        constructor(data: T) {
            this.data = data
        }
    }

    export class AssemblingMachine extends BaseEntity<schema.AssemblingMachine> {
        canBuildRecipe(recipe: Recipe) {
            if (this.data.crafting_categories.indexOf(recipe.category) == -1) {
                return false
            }
            if (recipe.ingredients.length > this.data.ingredient_count) {
                return false
            }
            return true
        }
    }
}

export class GameData {
    raw: schema.Root

    items: Item[] = [];
    itemMap: {[name: string]: Item} = {};
    fluids: Fluid[] = [];
    fluidMap: {[name: string]: Fluid} = {};

    recipes: Recipe[] = [];
    recipeMap: {[name: string]: Recipe} = {};

    entities: {
        "assembling-machine": Entity.AssemblingMachine[]
    }

    constructor(data: schema.Root) {
        this.raw = data

        this.entities = {
            'assembling-machine': values(data['assembling-machine']).map((m) => new Entity.AssemblingMachine(m))
        }

        for (let itemName in data.items) {
            const thing = data.items[itemName];
            if ("type" in thing && thing.type == "fluid") {
                const fluid = new Fluid(thing)
                this.fluids.push(fluid)
                this.fluidMap[fluid.name] = fluid
            } else {
                const item = new Item(thing);
                this.items.push(item);
                this.itemMap[item.name] = item;
            }
        }

        for (let recipeName in data.recipes) {
            const recipe = new Recipe(data.recipes[recipeName], this);

            // Filter to only recipes buildable by knonwn assembling machines
            let hasMachine = false 
            for (let machine of this.entities['assembling-machine']) {
                if (machine.canBuildRecipe(recipe)) {
                    hasMachine = true
                    break
                }
            }
            if (!hasMachine) {
                continue
            }

            this.recipeMap[recipe.name] = recipe;
            this.recipes.push(recipe)

            for (let ingredient of recipe.ingredients) {
                ingredient.item.usedBy.push(recipe);
            }
            for (let product of recipe.products) {
                product.item.madeBy.push(recipe);
            }
        }
    }
}
