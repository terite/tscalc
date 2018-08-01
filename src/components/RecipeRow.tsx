import { h, Component } from "preact";

import * as game from "../game"


interface Props {
    recipe: game.Recipe
}

interface State {
    machines: number
}

export class RecipeRow extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = {
            machines: 1
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
            this.setState({machines: num});
        }
    }

    calcProducts() {
        const amounts = {}
        for (let product of this.props.recipe.products) {
            amounts[product.name]
        }
    }

    renderProduct() {

    }

    render() {
        return (
            <div>
                Recipe <strong>{this.props.recipe.niceName()}</strong> with {this.state.machines} machines!
                <input
                    value={this.state.machines}
                    onInput={this.handleMachineChange}
                    type="number" min="0" step="1" />
                <ul>
                    this.calcProducts().map((p) => this.renderProduct(p))
                </ul>
            </div>
        )
    }

}
