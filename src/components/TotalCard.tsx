import * as React from 'react';
import { Icon } from './Icon';
import { withGame, RecipeRowData } from '../state';
import { Totals } from '../totals';
import * as game from '../game';

interface Props {
    gameData: game.GameData;
    rows: RecipeRowData[];
}

function RawTotalCard(props: Props) {
    const totals = new Totals();
    for (let row of props.rows) {
        totals.addRow(row);
    }

    const { ingredients, products } = totals.reduce();
    if (!ingredients.length && !products.length) {
        return <div />;
    }

    props.gameData.sortByItem(products, (p) => p.item);

    return (
        <div className="card combined-totals">
            <div className="card-header">Combined Totals</div>
            <div className="card-body">
                <div className="container">
                    <div className="row">
                        <div className="col">
                            Ingredients:
                            {ingredients.map((ing, i) => (
                                <Icon
                                    key={i}
                                    obj={ing.item}
                                    text={ing.niceName()}
                                />
                            ))}
                        </div>
                        <div className="col">
                            Products:
                            {products.map((prod, i) => (
                                <Icon
                                    key={i}
                                    obj={prod.item}
                                    text={prod.niceName()}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export const TotalCard = withGame(RawTotalCard);
