import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as game from '../game';
import { AppActions, AppState, withBoth} from '../state';
import * as serialization from '../serialization';

import { App } from './App';

interface Props {
    actions: AppActions
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
        const response = await fetch('assets/landblock.json');
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

        console.log('scheduling call');
        this.props.actions.replaceState({ gameData });

        const urlState = serialization.getUrlState(gameData);
        if (urlState) {
            // everything comes from url state
            this.props.actions.replaceState(urlState);
        } else {
            // Load just settings
            const storageState = serialization.getLocalStorageState(gameData);
            if (storageState) {
                // everything comes from url state
                this.props.actions.replaceState(storageState);
            }
        }

        console.log('gameData', gameData);
        this.setState({ gameData });
    }

    // TODO: reimplement me for dakpan 2.0
    handleStateChange = (state: AppState) => {
        serialization.setUrlState(state);
        serialization.setLocalStorageState(state);
        return '';
    };

    render() {
        if (!this.state.gameData) {
            return (
                <h1>Loading...</h1>
            );
        }
        const sheet = `assets/sprite-sheet-${
            this.state.gameData.raw.sprites.hash
        }.png`;
        const style = `
        .game-icon {
            background-image: url(${sheet});
        }
        `;
        return (
            <>
                <Prefetch href={sheet} />
                <style>{style}</style>
                <App />
            </>
        );
    }
}

const Prefetch: React.FC<{href: string}> = (props) => {
    return ReactDOM.createPortal(
        <link rel="prefetch" href={props.href} />,
        document.head
    );
};

export const AppLoader = withBoth(RawAppLoader);
