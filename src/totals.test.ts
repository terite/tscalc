import { Rational } from './rational';
import { Totals } from './totals';
import {
  Entity,
  GameData,
  FluidIngredient,
  FluidProduct,
  Recipe,
} from './game';
import { RecipeRowData } from './state';

describe('Totals', () => {
  let gameData: GameData;
  let copperCable: Recipe;
  let barrel: Recipe;
  let unbarrel: Recipe;
  let machine: Entity;

  function row(recipe: Recipe): RecipeRowData {
    return {
      recipe,
      machine: machine,
      numMachines: Rational.one,
      modules: [],
      beaconModule: null,
      numBeacons: 0,
    };
  }

  beforeAll(() => {
    // @ts-ignore
    const dataRoot = require('../public/assets/kras-18.json');
    gameData = new GameData(dataRoot);

    copperCable = gameData.getRecipe('copper-cable');
    barrel = gameData.getRecipe('fill-water-barrel');
    unbarrel = gameData.getRecipe('empty-water-barrel');
    machine = gameData.getEntity('assembling-machine-2');
  });

  it('should start empty', () => {
    const t = new Totals();
    expect(t.ingredients).toHaveLength(0);
    expect(t.products).toHaveLength(0);
  });

  it('should add initial rows', () => {
    const t = new Totals([row(barrel)]);
    expect(t.ingredients).toHaveLength(2);
    expect(t.products).toHaveLength(1);
  });

  it('should merge same ingredients together', () => {
    const t = new Totals();
    t.addRow(row(copperCable));
    expect(t.ingredients).toHaveLength(1);
    expect(t.products).toHaveLength(1);

    t.addRow(row(copperCable));
    expect(t.ingredients).toHaveLength(1);
    expect(t.products).toHaveLength(1);
  });

  it('should merge matching ingredients', () => {
    const t = new Totals();
    t.addRow(row(barrel));

    t.addRow(row(unbarrel));
    expect(t.ingredients).toHaveLength(0);
    expect(t.products).toHaveLength(0);
  });

  it('should not merge different item ingredients', () => {
    const t = new Totals([row(barrel), row(copperCable)]);
    expect(t.ingredients).toHaveLength(3);
    expect(t.products).toHaveLength(2);
  });

  it('should not merge fluid ingredients with different temperatures', () => {
    const water = gameData.getItem('water');

    const ingHotWater = new FluidIngredient(
      {
        name: water.name,
        amount: 1,
        type: 'fluid',
        minimum_temperature: 75,
        maximum_temperature: 100,
      },
      gameData
    );

    const prodColdWater = new FluidProduct(
      {
        name: water.name,
        amount: 1,
        type: 'fluid',
        temperature: 1,
      },
      gameData
    );

    const t = new Totals();
    t.addIngredient(ingHotWater);
    t.addProduct(prodColdWater);

    expect(t.ingredients).toHaveLength(1);
    expect(t.products).toHaveLength(1);
  });
});
