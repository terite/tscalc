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
        let products = []
        for (let product of this.props.recipe.products) {
            products.push(product)
        }
        return products
    }

    renderProduct(product: game.Product) {
        return (<li key={product.name}>
            {product.amount.toString()} {product.item.niceName()}
        </li>)
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
                    {this.calcProducts().map((p) => this.renderProduct(p))}
                </ul>
            </div>
        )
    }

}
