import React from 'react';
import { useRecoilState } from 'recoil';
import usePromise from 'react-use-promise';

import { gameDataAtom } from '../atoms';

import { GameData } from '../game';

interface Props {
  jsonPath: string;
  child(gameData: GameData): React.ReactElement;
}

export const GameDataLoader: React.FC<Props> = ({ jsonPath, child }) => {
  const setGameState = useRecoilState(gameDataAtom)[1];

  const [gameData, error, status] = usePromise<GameData>(async () => {
    const response = await fetch(
      `${process.env.PUBLIC_URL}/assets/kras-18.json`
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
    setGameState(gameData);
    return gameData;
  }, [jsonPath]);

  if (status === 'pending') {
    return <h3>Loading game data...</h3>;
  } else if (status === 'rejected') {
    return (
      <div>
        <h3>Error loading game data!</h3>
        <pre>{String(error)}</pre>
      </div>
    );
  } else {
    return child(gameData!);
  }
};

export default GameDataLoader;
