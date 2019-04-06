import * as React from 'react';

import * as signal from '../signal';
import * as game from '../game';
import { Rational } from '../rational';

import { RecipeRow } from './RecipeRow';
import { RecipePicker } from './RecipePicker';
import { TotalCard } from './TotalCard';

import { RecipeRowData } from '../state';

import State, { AppState, withBoth} from '../state';
import * as su from '../stateutil';

interface Props {
    rows: RecipeRowData[];
    state: AppState;
    actions: typeof State.actions;
}

class RawRecipeGroup extends React.Component<Props, {}> {
    componentDidMount() {
        signal.addRecipeRow.addHandler(this.handlePickRecipe);
    }

    componentWillUnmount() {
        signal.addRecipeRow.removeHandler(this.handlePickRecipe);
    }

    handlePickRecipe = (recipe: game.Recipe) => {
        this.props.actions.addRow({
            recipe: recipe,
            machine: su.getDefaultMachine(recipe, this.props.state),
            numMachines: Rational.one,
            modules: [],
            beaconModule: null,
            numBeacons: 0,
        });
    };

    renderRow = (data: RecipeRowData, index: number) => {
        return <RecipeRow key={data.recipe.name} index={index} {...data} />;
    };

    render() {
        const gd = this.props.state.gameData;
        const availableRecipes = gd.recipes.filter(
            (recipe) => {
                return !this.props.rows.some((row) => row.recipe == recipe);
            }
        );

        return (
            <div className="recipe-group">
                <RecipePicker
                    recipes={availableRecipes}
                    onPickRecipe={this.handlePickRecipe}
                />
                <hr />
                {this.props.rows.map(this.renderRow)}
                <hr />
                <TotalCard rows={this.props.rows} />
            </div>
        );
    }
}

export const RecipeGroup = withBoth(RawRecipeGroup);
