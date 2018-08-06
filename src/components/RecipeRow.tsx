import { h, Component } from "preact";

import * as game from "../game"
import {Totals} from '../totals'


interface Props {
    gameData: game.GameData
    recipe: game.Recipe
}

interface State {
    numMachines: number

    // TOOD: modules
}

export class RecipeRow extends Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {
            numMachines: 1,
        }
    }

    public handleMachineChange = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const num = Number(target.value);
        if (!Number.isInteger(num)) {
            // TODO: error?
            return
        }
        if (Number.isInteger(num) && num >= 0) {
            this.setState({numMachines: num});
        }
    }

    calcProducts() {
        let gd = this.props.gameData
        let products = []
        let totals = Totals.fromRecipeRow(this)
        for (let name in totals.itemAmounts) {
            let amount = totals.itemAmounts[name]
            products.push(
                <li key={name}>
                    {amount.toString()} {gd.itemMap[name].niceName()}
                </li>
            )
        }

        return products
    }

    render() {
        return (
            <div>
                Recipe <strong>{this.props.recipe.niceName()}</strong> with {this.state.numMachines} machines!
                <input
                    value={this.state.numMachines}
                    onInput={this.handleMachineChange}
                    type="number" min="0" step="1" />
                <ul>
                    {this.calcProducts()}
                </ul>
            </div>
        )
    }

}
