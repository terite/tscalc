export type LocalisedName = {[locale: string]: string}


interface Effectable {
    allowed_effects: ("consumption" | "pollution" | "productivity" | "speed")[]
    module_slots: number
}

export interface BaseEntity {
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

export interface AssemblingMachine extends BaseEntity, Effectable {
    crafting_categories: string[]
    crafting_speed: number
    ingredient_count: number
}

export interface MiningDrill extends BaseEntity, Effectable {
    mining_power: number;
    mining_speed: number;
    resource_categories: string[];
}

export interface OffshorePump extends BaseEntity {
    fluid: string
}

export interface RocketSilo extends AssemblingMachine {
    rocket_parts_required: number;
}

export interface TransportBelt extends BaseEntity {
    belt_speed: number
}

interface BaseItemOrFluid {
    name: string;
    localised_name: LocalisedName;
    icon_col: number;
    icon_row: number;
    group: string;
    subgroup: string
    order: string;
}

export interface BaseItem extends BaseItemOrFluid {
    rocket_launch_products: Product[]
}

export interface FluidItem extends BaseItemOrFluid {
    type: "fluid";
    default_temperature: number;
}

interface FuelItem extends BaseItem {
    fuel_category: string;
    fuel_value: number;
}

export interface ModuleItem extends BaseItem {
    type: "module"
    category: "effectivity" | "productivity" | "speed"
    effect: {
        consumption?: {bonus: number}
        pollution?: {bonus: number}
        productivity?: {bonus: number}
        speed?: {bonus: number}
    }
    limitation: string[]
}

export type Item = BaseItem | FuelItem | ModuleItem | FluidItem

export interface Ingredient {
    name: string
    amount: number
    type?: "item" | "fluid"
    minimum_temperature?: number
    maximum_temperature?: number
}

interface BaseProduct {
    name: string
    type?: "item" | "fluid"
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
    results: Product[];
    type: "recipe";
    order: string;

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

    sprites: {
        hash: string
        extra: {[s:string]: {
            icon_row: number
            icon_col: number
            name?: string
        }}
    }

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
