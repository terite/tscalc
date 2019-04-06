import * as React from 'react';
import * as Fuse from 'fuse.js';
import debounce = require('lodash/debounce');

import * as game from '../game';
import * as signal from '../signal';

import { Icon } from './Icon';

type KeyTypes = 'niceName' | 'name';

function getFn(recipe: game.Recipe, key: string) {
    switch (key as KeyTypes) {
        case 'niceName':
            return recipe.niceName();
        case 'name':
            return recipe.name;
    }
}

const RE_ADVANCED = /((?:produces)|(?:consumes)):([a-z0-9\-]+)/g;

interface Props {
    recipes: game.Recipe[];
    onPickRecipe(r: game.Recipe): void;
}

interface State {
    query: string;
    matches: game.Recipe[];
}

export class RecipePicker extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            query: '',
            matches: [],
        };

        signal.addIngredientFilter.addHandler(this.handleIngredientClick);
        signal.addProductFilter.addHandler(this.handleProductClick);
    }

    componentWillUnmount() {
        this.debCalculateMatches.cancel();
        signal.addIngredientFilter.removeHandler(this.handleIngredientClick);
        signal.addProductFilter.removeHandler(this.handleProductClick);
    }

    public handleIngredientClick = (ingredient: game.Ingredient) => {
        const term = `produces:${ingredient.name}`;
        if (!this.state.query.includes(term)) {
            this.setQuery(`${this.state.query} ${term}`, () => {
                this.calculateMatches();
            });
        }
    };

    public handleProductClick = (product: game.Product) => {
        const term = `consumes:${product.name}`;
        if (!this.state.query.includes(term)) {
            this.setQuery(`${this.state.query} ${term}`, () => {
                this.calculateMatches();
            });
        }
    };

    public handleQueryInput = (event: React.FormEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        this.setQuery(target.value);
    };

    public handleRecipeClick = (recipe: game.Recipe) => {
        this.props.onPickRecipe(recipe);
        this.setQuery('');
    };

    public setQuery = (query: string, callback?: () => void) => {
        if (!query.trim()) {
            this.debCalculateMatches.cancel();
            this.setState(
                {
                    query: '',
                    matches: [],
                },
                callback
            );
        } else {
            this.setState({ query: query }, callback);
            this.debCalculateMatches();
        }
    };

    calculateMatches() {
        let query = this.state.query.trim().toLowerCase();
        if (!query) {
            this.setState({ matches: [] });
            return;
        }

        const conditions = {
            consumes: [] as string[],
            produces: [] as string[],
        };

        type ckey = keyof typeof conditions;

        query = query
            .replace(RE_ADVANCED, (_, key, value) => {
                conditions[key as ckey].push(value);
                return '';
            })
            .trim();

        let recipes = this.props.recipes;
        if (conditions.consumes.length || conditions.produces.length) {
            recipes = recipes.filter((recipe) => {
                for (let name of conditions.consumes) {
                    if (!recipe.ingredients.some((i) => i.name == name)) {
                        return false;
                    }
                }
                for (let name of conditions.produces) {
                    if (!recipe.products.some((i) => i.name == name)) {
                        return false;
                    }
                }
                return true;
            });
        }

        if (query) {
            const fuse = new Fuse(recipes, {
                shouldSort: true,
                getFn: getFn,
                keys: [
                    {
                        name: 'niceName',
                        weight: 0.7,
                    },
                    {
                        name: 'name',
                        weight: 0.2,
                    },
                ],
            });
            recipes = fuse.search(query);
        }
        this.setState({ matches: recipes });
    }

    debCalculateMatches = debounce(this.calculateMatches.bind(this), 200);

    renderMatches() {
        if (!this.state.matches.length) {
            return '';
        }
        let matches = this.state.matches;
        if (matches.length > 100) {
            matches = matches.slice(0, 100);
        }
        return (
            <table className="table table-hover">
                <thead>
                    <tr>
                        <th>Recipe</th>
                        <th>Time</th>
                        <th>Ingredients</th>
                        <th>Products</th>
                    </tr>
                </thead>
                <tbody>
                    {matches.map((r) => (
                        <RecipeMatch
                            recipe={r}
                            key={r.name}
                            onClick={this.handleRecipeClick}
                        />
                    ))}
                </tbody>
            </table>
        );
    }

    render() {
        return (
            <div className="recipe-picker">
                <div>
                    <input
                        className="editable-display form-control"
                        placeholder="Search for a recipe"
                        value={this.state.query}
                        onChange={this.handleQueryInput}
                    />
                </div>
                {this.renderMatches()}
            </div>
        );
    }
}

interface RecipeMatchProps {
    recipe: game.Recipe;
    onClick(recipe: game.Recipe): void;
}

function card(body: React.ReactNode) {
    return (
        <div className="card">
            <div className="card-body">{body}</div>
        </div>
    );
}

class RecipeMatch extends React.PureComponent<RecipeMatchProps, {}> {
    handleClickAdd = () => {
        this.props.onClick(this.props.recipe);
    };

    render() {
        const recipe = this.props.recipe;
        const ingredients = recipe.ingredients.map((ing, i) => (
            <Icon key={i} obj={ing.item} tooltip={card(ing.niceName())} />
        ));
        const products = recipe.products.map((prod, i) => (
            <Icon key={i} obj={prod.item} tooltip={card(prod.niceName())} />
        ));
        return (
            <tr onClick={this.handleClickAdd}>
                <td className="result-name">
                    <Icon
                        obj={recipe}
                        text={recipe.niceName()
                    }/>
                </td>
                <td>{recipe.crafting_time.toDecimal()}</td>
                <td>{ingredients}</td>
                <td>{products}</td>
            </tr>
        );
    }
}
