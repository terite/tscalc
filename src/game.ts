type TODO = unknown;

import {Rational} from "./rational"
import {assert} from "./util"

type LocalisedName = {[locale: string]: string}

namespace JsonData {
    interface BaseEntity {
        name: string;
        localised_name: LocalisedName;
        icon_col: number;
        icon_row: number;
    };

    type EntityMap = {[name: string]: BaseEntity}

    export interface Item {
        name: string;
        localised_name: LocalisedName;
        icon_col: number;
        icon_row: number;
    }

    export interface Ingredient {
        name: string
        amount: number
        type?: "item" | "fluid"
        minimum_temperature?: number
        maximum_temperature?: number
    }

    interface BaseResult {
        name: string
        type?: "item" | "fluid"
        temperature?: number
        probability?: number
    }

    interface ResultRange extends BaseResult {
        amount_min: number
        amount_max: number
    }
    interface ResultAmount extends BaseResult {
        amount: number
    }

    export type Result = ResultAmount | ResultRange;

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
        results: Result[];
        type: "recipe";
    }

    export interface Root {
        fluids: string[];
        fuel: string[];
        modules: string[];

        recipes: {[name: string]: Recipe};
        resource: TODO;
        sprites: TODO;

        items: {[name: string]: Item};

        // other entities
        "accumulator": EntityMap;
        "assembling-machine": EntityMap;
        "boiler": EntityMap;
        "generator": EntityMap;
        "mining-drill": EntityMap;
        "offshore-pump": EntityMap;
        "reactor": EntityMap;
        "rocket-silo": EntityMap;
        "solar-panel": EntityMap;
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
    
    constructor(d: JsonData.Ingredient | JsonData.Result, gd: GameData) {
        this.type = d.type || "item";
        this.name = d.name;
        this.item = gd.itemMap[d.name]
    }
}

export class Ingredient extends BaseIngredient {
    amount: Rational
    minimum_temperature: number | undefined;
    maximum_temperature: number | undefined;

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

    constructor(d: JsonData.Result, gd: GameData) {
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
