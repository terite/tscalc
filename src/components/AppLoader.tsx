import * as React from 'react';

import * as game from '../game';
import State, { AppState } from '../state';
import * as serialization from '../serialization';

import { App } from './App';

interface State {
    gameData: game.GameData | null;
}

export class AppLoader extends React.Component<{}, State> {
    constructor(props: {}) {
        super(props);
        this.state = {
            gameData: null,
        };
    }
    async componentDidMount() {
        try {
            await this.load();
        } catch (err) {
            this.setState(() => {
                throw err;
            });
        }
    }

    async load() {
        const response = await fetch('assets/landblock.json');
        if (response.status != 200) {
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

        State.actions.replaceState({ gameData });

        const urlState = serialization.getUrlState(gameData);
        if (urlState) {
            // everything comes from url state
            State.actions.replaceState(urlState);
        } else {
            // Load just settings
            const storageState = serialization.getLocalStorageState(gameData);
            if (storageState) {
                // everything comes from url state
                State.actions.replaceState(storageState);
            }
        }

        this.setState({ gameData });
    }

    handleStateChange = (state: AppState) => {
        serialization.setUrlState(state);
        serialization.setLocalStorageState(state);
        return '';
    };

    render() {
        if (!this.state.gameData) {
            return (
                <State.Provider>
                    <h1>Loading...</h1>
                </State.Provider>
            );
        }
        const style = `
        .game-icon {
            background-image: url(assets/sprite-sheet-${
                this.state.gameData.raw.sprites.hash
            }.png);
        }
        `;
        return (
            <State.Provider>
                <style>{style}</style>
                <State.Consumer>{this.handleStateChange}</State.Consumer>
                <App />
            </State.Provider>
        );
    }
}
