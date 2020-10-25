import React from 'react';
import { useRecoilState } from 'recoil';
import usePromise from 'react-use-promise';

import { gameDataAtom } from '../atoms';

import { GameData } from '../game';

interface Props {
  child(gameData: GameData): React.ReactElement;
}

const datasets = {
  'kras-18': 'Krastorio2 for 1.0.0',
  'seablock-17': 'Seablock for 0.17',
} as const;

async function loadGameData(
  filename: keyof typeof datasets
): Promise<GameData> {
  const response = await fetch(
    `${process.env.PUBLIC_URL}/assets/${filename}.json`
  );

  if (response.status !== 200) {
    throw new Error(
      `Could not load game data, got HTTP status ${response.status}`
    );
  }

  let parsed;
  try {
    parsed = await response.json();
  } catch (err) {
    throw new Error(`Could not parse game data: ${err}`);
  }
  const gameData = new GameData(parsed);
  return gameData;
}

export const GameDataLoader: React.FC<Props> = ({ child }) => {
  const setGameState = useRecoilState(gameDataAtom)[1];

  const [gameData, error, status] = usePromise<GameData | null>(async () => {
    const gameData = await loadGameData('kras-18');
    setGameState(gameData);
    return gameData;
  }, []);

  if (status === 'pending') {
    return <h3>Loading game data...</h3>;
  } else if (status === 'rejected') {
    return (
      <div>
        <h3>Error loading game data!</h3>
        <pre>{String(error)}</pre>
      </div>
    );
  } else if (gameData) {
    return child(gameData);
  } else {
    throw new Error('Somehow missing gamedata');
  }
};

export default GameDataLoader;
