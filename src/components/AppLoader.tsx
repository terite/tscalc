import React, { useCallback, useEffect, useRef } from 'react';
import * as ReactDOM from 'react-dom';
import { atom, useRecoilValue, useSetRecoilState } from 'recoil';

import * as game from '../game';
import { groupsState, groupAtomsAtom, settingsAtom } from '../atoms';
import { CompleteState, RecipeGroupData } from '../state';
import * as serialization from '../serialization';

import { error } from '../notifications';

import { App } from './App';

interface RawAppLoaderProps {
  gameData: game.GameData;
  onSetPreviousState(state: CompleteState): void;
}

interface State {
  loaded: boolean;
}

class RawAppLoader extends React.PureComponent<RawAppLoaderProps, State> {
  state: State = {
    loaded: false,
  };

  _mounted: boolean = false;

  componentDidMount(): void {
    this._mounted = true;
    this.load().then(
      () => {
        if (this._mounted)
          this.setState({ loaded: true });
      },
      (err) => {
        if (this._mounted)
          this.setState(() => {
            throw err;
          });
      }
    );
  }

  componentWillUnmount(): void {
    this._mounted = false;
  }


  getPreviousState(): CompleteState | undefined {
    let urlState: CompleteState | null = null;
    try {
      urlState = serialization.getUrlState(this.props.gameData);
    } catch (err: unknown) {
      error(
        <>
          <b>Error loading from URL</b>
          <br />
          <pre>{String(err)}</pre>
        </>
      );
      console.error('error loading from url', err);
    }
    if (urlState) return urlState;

    try {
      const storageState = serialization.getLocalStorageState(
        this.props.gameData
      );
      if (storageState) return storageState;
    } catch (err: unknown) {
      console.error('Failed to load local storage state', err);
    }
  }

  async load(): Promise<void> {
    const previousState = this.getPreviousState();
    if (previousState)
      this.props.onSetPreviousState(previousState);
  }

  render(): React.ReactNode {
    if (!this.state.loaded) {
      return <h1>Loading...</h1>;
    }
    const sheet = `${process.env.PUBLIC_URL}/assets/sprite-sheet-${this.props.gameData.spriteHash}.png`;
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
  const groups = useRecoilValue(groupsState);
  const settings = useRecoilValue(settingsAtom);
  const initialRender = useRef(true);

  useEffect(() => {
    // don't waste time re-writing state from the initial render
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    const completeState: CompleteState = {
      groups: groups.map((g) => g[0]),
      settings: settings,
    };
    serialization.setUrlState(completeState, gameData);
    serialization.setLocalStorageState(completeState, gameData);
  }, [gameData, groups, settings]);

  return null;
};

const Prefetch: React.FC<{ href: string }> = (props) => {
  return ReactDOM.createPortal(
    <link rel="prefetch" href={props.href} />,
    document.head
  );
};

interface AppLoaderProps {
  gameData: game.GameData;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ gameData }) => {
  const setGroupAtoms = useSetRecoilState(groupAtomsAtom);
  const setSettings = useSetRecoilState(settingsAtom);

  const handleSetPreviousState = useCallback(
    (state: CompleteState) => {
      let i = 0;
      setGroupAtoms(
        state.groups.map((group) => {
          return atom<RecipeGroupData>({
            key: `group-${Date.now()}-${i++}`,
            default: group,
          });
        })
      );
      setSettings(state.settings);
    },
    [setGroupAtoms, setSettings]
  );

  return (
    <RawAppLoader
      gameData={gameData}
      onSetPreviousState={handleSetPreviousState}
    />
  );
};
