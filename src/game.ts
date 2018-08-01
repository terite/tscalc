type TODO = unknown;

import {Rational} from "./rational"
import {assert} from "./util"

type LocalisedName = {[locale: string]: string}

namespace JsonData {

    interface Effectable {
        // TODO: export empty allowed_effects
        allowed_effects?: Array<"consumption" | "pollution" | "productivity" | "speed">
        module_slots: number
    }

    interface BaseEntity {
        name: string;
        localised_name: LocalisedName;
        icon_col: number;
        icon_row: number;

        energy_usage?: number;
        energy_source?: {
            fuel_category: string
            type: "burner"
        }
    };

    interface AssemblingMachine extends BaseEntity, Effectable {
        crafting_categories: string[]
        crafting_speed: number
        ingredient_count: number
    }

    interface MiningDrill extends BaseEntity, Effectable {
        mining_power: number;
        mining_speed: number;
        resource_categories: string[];
    }

    interface OffshorePump extends BaseEntity {
        fluid: string
    }

    interface RocketSilo extends AssemblingMachine, Effectable {
        rocket_parts_required: number;
    }

    interface TransportBelt extends BaseEntity {
        belt_speed: number
    }

    interface BaseItem {
        name: string;
        localised_name: LocalisedName;
        icon_col: number;
        icon_row: number;
        group: string;
        subgroup: string
        order: string;
        type: string;

        // rocket_launch_products: Result[]  // TODO: collect
    }

    interface FuelItem extends BaseItem {
        fuel_category: string;
        fuel_value: number;
    }

    interface ModuleItem extends BaseItem {
        category: "effectivity" | "productivity" | "speed"
        effect: {
            consumption?: {bonus: number}
            pollution?: {bonus: number}
            productivity?: {bonus: number}
            speed?: {bonus: number}
        }
        limitation: string[]
    }

    export type Item = BaseItem | FuelItem | ModuleItem

    export interface Ingredient {
        name: string
        amount: number
        type?: "item" | "fluid" // TODO: always export type
        minimum_temperature?: number
        maximum_temperature?: number
    }

    interface BaseProduct {
        name: string
        type?: "item" | "fluid" // TODO: always export type
        temperature?: number
        probability?: number
    }

    interface ProductRange extends BaseProduct {
        amount_min: number
        amount_max: number
    }
    interface ProductAmount extends BaseProduct {
        amount: number
    }

    export type Product = ProductAmount | ProductRange;

    export interface Recipe {
        name: string;
        localised_name: LocalisedName;
        category: string;
        energy_required: number;
        group: string;
        subgroup: string;
        icon_col: number;
        icon_row: number;
        ingredients: Ingredient[];
        results: Product[]; // TODO: rename results -> products
        type: "recipe";
        order: string;

        requester_paste_multiplier?: number // TODO: remove
        main_product?: string
    }

    export interface Resource {
        name: string;
        localised_name: LocalisedName;
        icon_col: number;
        icon_row: number;

        category: string;

        minable: {
            hardness: number;
            mining_time: number;
            mining_particle?: string;  // TODO: remove
            results: Product[]
            fluid_amount?: number
            required_fluid?: string
        }

    }

    export interface Root {
        active_mods: {[name: string]: string};

        groups: {[groupName: string]: {
            order: string
            subgroups: {[subName: string]: string}
        }}


        fluids: string[];
        fuel: string[];
        modules: string[];

        recipes: {[name: string]: Recipe};
        resource: {[name: string]: Resource};
        sprites: TODO;

        items: {[name: string]: Item};

        // other entities
        "assembling-machine": {[name: string]: AssemblingMachine};
        "furnace": {[name: string]: AssemblingMachine};
        "mining-drill": {[name: string]: MiningDrill};
        "offshore-pump": {[name: string]: OffshorePump};
        "reactor": {[name: string]: BaseEntity};
        "rocket-silo": {[name: string]: RocketSilo};
        "transport-belt": {[name: string]: TransportBelt}
    }
}

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

export class Item extends BaseDisplayable {
    usedBy: Recipe[] = [];
    madeBy: Recipe[] = [];

    constructor(d: JsonData.Item) {
        super(d);
        this.name = d.name;
        this.localised_name = d.localised_name
        this.icon_col = d.icon_col;
        this.icon_row = d.icon_row;
    }
}

export class BaseIngredient {
    type: "item" | "fluid";
    name: string;
    item: Item;
    
    constructor(d: JsonData.Ingredient | JsonData.Product, gd: GameData) {
        this.type = d.type || "item";
        this.name = d.name;
        this.item = gd.itemMap[d.name]
    }
}

export class Ingredient extends BaseIngredient {
    amount: Rational
    minimum_temperature?: number;
    maximum_temperature?: number;

    constructor(d: JsonData.Ingredient, gd: GameData) {
        super(d, gd)
        this.amount = Rational.fromFloat(d.amount)
        this.minimum_temperature = d.minimum_temperature;
        this.maximum_temperature = d.maximum_temperature;
    }
}


export class Product extends BaseIngredient {
    temperature?: number;
    amount: Rational

    constructor(d: JsonData.Product, gd: GameData) {
        super(d, gd)
        this.temperature = d.temperature

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

export class Recipe extends BaseDisplayable {
    category: string;
    ingredients: Ingredient[];
    products: Product[];
    crafting_time: Rational;

    constructor(d: JsonData.Recipe, gd: GameData) {
        super(d)
        this.name = d.name;
        this.category = d.category;
        this.crafting_time = Rational.fromFloat(d.energy_required);

        this.ingredients = d.ingredients.map((i) => new Ingredient(i, gd));
        this.products = d.results.map((i) => new Product(i, gd));

    }
}

export class GameData {
    items: Item[] = [];
    itemMap: {[name: string]: Item} = {};

    recipes: Recipe[] = [];
    recipeMap: {[name: string]: Recipe} = {};

    constructor(data: JsonData.Root) {
        for (let itemName in data.items) {
            const item = new Item(data.items[itemName]);
            this.items.push(item);
            this.itemMap[item.name] = item;
        }

        for (let recipeName in data.recipes) {
            const recipe = new Recipe(data.recipes[recipeName], this);
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
