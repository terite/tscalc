import React, { useEffect } from 'react';
import * as ReactDOM from 'react-dom';

import * as game from '../game';
import { AppActions, withBoth, useDakpan } from '../state';
import * as serialization from '../serialization';

import { App } from './App';

interface Props {
  actions: AppActions;
  gameData: game.GameData;
}

interface State {
  loaded: boolean;
}

class RawAppLoader extends React.PureComponent<Props, State> {
  state: State = {
    loaded: false,
  };

  componentDidMount(): void {
    this.load().then(
      () => {
        this.setState({ loaded: true });
      },
      (err) => {
        this.setState(() => {
          throw err;
        });
      }
    );
  }

  async load(): Promise<void> {
    const urlState = serialization.getUrlState(this.props.gameData);
    if (urlState) {
      // everything comes from url state
      await this.props.actions.replaceState(urlState);
    } else {
      // Load just settings
      try {
        const storageState = serialization.getLocalStorageState(
          this.props.gameData
        );
        if (storageState) {
          // everything comes from url state
          await this.props.actions.replaceState(storageState);
        }
      } catch (err) {
        console.error('Failed to load local storage state', err);
      }
    }
  }

  render(): React.ReactNode {
    if (!this.state.loaded) {
      return <h1>Loading...</h1>;
    }
    const sheet = `${process.env.PUBLIC_URL}/assets/sprite-sheet-${this.props.gameData.raw.sprites.hash}.png`;
    const style = `
        .game-icon {
            background-image: url(${sheet});
        }
        `;
    return (
      <>
        <StateWriter gameData={this.props.gameData} />
        <Prefetch href={sheet} />
        <style>{style}</style>
        <App gameData={this.props.gameData} />
      </>
    );
  }
}

const StateWriter: React.FC<{ gameData: game.GameData }> = ({ gameData }) => {
  const [state] = useDakpan();

  useEffect(() => {
    serialization.setUrlState(state, gameData);
    serialization.setLocalStorageState(state, gameData);
  }, [gameData, state]);

  return null;
};

const Prefetch: React.FC<{ href: string }> = (props) => {
  return ReactDOM.createPortal(
    <link rel="prefetch" href={props.href} />,
    document.head
  );
};

export const AppLoader = withBoth(RawAppLoader);
