import * as React from 'react';
import Fuse from 'fuse.js';
import classNames from 'classnames';

import { debounce } from '../util';

import * as game from '../game';
import * as signal from '../signal';

import { Icon } from './Icon';
import { IngredientCard } from './IngredientCard';
import { RecipeCard } from './RecipeCard';

import styles from './RecipePicker.module.css';

const getFn: Fuse.FuseGetFunction<game.Recipe> = (obj, path) => {
  if (typeof path === 'string') {
    throw new Error(`path unexpectedly string: ${path}`);
  }
  if (path.length !== 1) {
    throw new Error(`path unexpectedly long/short: ${path}`);
  }
  switch (path[0]) {
    case 'niceName':
      return obj.niceName;
    case 'name':
      return obj.name;
    default:
      throw new Error(`Unsupported path: ${path}`);
  }
};

const RE_ADVANCED = /((?:produces)|(?:consumes)):([a-z0-9-]+)/g;

interface Props {
  className?: string;
  recipes: game.Recipe[];
  onPickRecipe(r: game.Recipe): void;
}

interface State {
  query: string;
  matches: game.Recipe[];
}

export class RecipePicker extends React.PureComponent<Props, State> {
  inputRef = React.createRef<HTMLInputElement>();

  state: State = {
    query: '',
    matches: [],
  };

  componentDidMount(): void {
    signal.addIngredientFilter.addHandler(this.handleIngredientClick);
    signal.addProductFilter.addHandler(this.handleProductClick);
  }

  componentWillUnmount(): void {
    this.debCalculateMatches.cancel();
    signal.addIngredientFilter.removeHandler(this.handleIngredientClick);
    signal.addProductFilter.removeHandler(this.handleProductClick);
  }

  handleIngredientClick = (ingredient: game.Ingredient): void => {
    const term = `produces:${ingredient.name}`;
    if (!this.state.query.includes(term)) {
      this.setQuery(`${this.state.query} ${term}`, () => {
        this.calculateMatches();
      });
      this.inputRef.current?.scrollIntoView();
    }
  };

  handleProductClick = (product: game.Product): void => {
    const term = `consumes:${product.name}`;
    if (!this.state.query.includes(term)) {
      this.setQuery(`${this.state.query} ${term}`, () => {
        this.calculateMatches();
      });
      this.inputRef.current?.scrollIntoView();
    }
  };

  handleQueryInput = (event: React.FormEvent<HTMLInputElement>): void => {
    const target = event.target as HTMLInputElement;
    this.setQuery(target.value);
  };

  handleRecipeClick = (recipe: game.Recipe): void => {
    this.props.onPickRecipe(recipe);
    this.setQuery('');
  };

  setQuery = (query: string, callback?: () => void): void => {
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

  calculateMatches(): void {
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
        for (const name of conditions.consumes) {
          if (!recipe.ingredients.some((i) => i.name === name)) {
            return false;
          }
        }
        for (const name of conditions.produces) {
          if (!recipe.products.some((i) => i.name === name)) {
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
      const results = fuse.search(query);
      recipes = results.map((r) => r.item);
    }
    this.setState({ matches: recipes });
  }

  debCalculateMatches = debounce(this.calculateMatches.bind(this), 200);

  renderMatches(): React.ReactNode {
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

  render(): React.ReactNode {
    return (
      <div className={classNames(styles.RecipePicker, this.props.className)}>
        <div>
          <input
            type="search"
            ref={this.inputRef}
            className="editable-display form-control"
            placeholder="What do you want to build?"
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

class RecipeMatch extends React.PureComponent<RecipeMatchProps, never> {
  handleClickAdd = (): void => {
    this.props.onClick(this.props.recipe);
  };

  render(): React.ReactNode {
    const recipe = this.props.recipe;
    const ingredients = recipe.ingredients.map((ing) => (
      <Icon
        key={ing.name}
        obj={ing.item}
        tooltip={() => <IngredientCard obj={ing} />}
      />
    ));
    const products = recipe.products.map((prod) => (
      <Icon
        key={prod.name}
        obj={prod.item}
        tooltip={() => <IngredientCard obj={prod} />}
      />
    ));
    return (
      <tr onClick={this.handleClickAdd}>
        <td className={styles.ResultName}>
          <Icon
            obj={recipe}
            text={recipe.niceName}
            tooltip={() => <RecipeCard recipe={recipe} />}
          />
        </td>
        <td>{recipe.craftingTime.toDecimal()}</td>
        <td>{ingredients}</td>
        <td>{products}</td>
      </tr>
    );
  }
}
