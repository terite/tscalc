import React, { useEffect } from 'react';
import * as ReactDOM from 'react-dom';

import * as game from '../game';
import { AppActions, withBoth, useDakpan } from '../state';
import * as serialization from '../serialization';

import { App } from './App';

interface Props {
  actions: AppActions;
}
interface State {
  gameData: game.GameData | null;
}

class RawAppLoader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      gameData: null,
    };
  }
  componentDidMount() {
    this.load().catch((err) => {
      this.setState(() => {
        throw err;
      });
    });
  }

  async load() {
    const response = await fetch('assets/seablock-17.json');
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

    const gameData = new game.GameData(parsed);

    this.props.actions.replaceState({ gameData });

    const urlState = serialization.getUrlState(gameData);
    if (urlState) {
      // everything comes from url state
      this.props.actions.replaceState(urlState);
    } else {
      // Load just settings
      try {
        const storageState = serialization.getLocalStorageState(gameData);
        if (storageState) {
          // everything comes from url state
          this.props.actions.replaceState(storageState);
        }
      } catch (err) {
        console.error('Failed to load local storage state', err);
      }
    }

    this.setState({ gameData });
  }

  render() {
    if (!this.state.gameData) {
      return <h1>Loading...</h1>;
    }
    const sheet = `assets/sprite-sheet-${this.state.gameData.raw.sprites.hash}.png`;
    const style = `
        .game-icon {
            background-image: url(${sheet});
        }
        `;
    return (
      <>
        <StateWriter />
        <Prefetch href={sheet} />
        <style>{style}</style>
        <App />
      </>
    );
  }
}

const StateWriter: React.FC = () => {
  const [state] = useDakpan();

  useEffect(() => {
    serialization.setUrlState(state);
    serialization.setLocalStorageState(state);
  }, [state]);

  return null;
};

const Prefetch: React.FC<{ href: string }> = (props) => {
  return ReactDOM.createPortal(
    <link rel="prefetch" href={props.href} />,
    document.head
  );
};

export const AppLoader = withBoth(RawAppLoader);
