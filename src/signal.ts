import * as game from './game';

interface SignalHandler<T> {
    (arg: T): void;
}

export class Signal<T> {
    handlers: SignalHandler<T>[] = [];

    addHandler(handler: SignalHandler<T>) {
        const index = this.handlers.indexOf(handler);
        if (index == -1) {
            this.handlers.push(handler);
        }
    }

    removeHandler(handler: SignalHandler<T>) {
        const index = this.handlers.indexOf(handler);
        if (index != -1) {
            this.handlers.splice(index, 1);
        }
    }

    dispatch = (arg: T) => {
        for (let handler of this.handlers) {
            handler(arg);
        }
    };
}

export const addIngredientFilter = new Signal<game.Ingredient>();
export const addProductFilter = new Signal<game.Product>();
export const addRecipeRow = new Signal<game.Recipe>();
