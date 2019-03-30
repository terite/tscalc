import * as React from "react";

import { RecipeGroup } from "./RecipeGroup";
import { Settings } from "./Settings";

import State, { AppState, withBoth } from "../state";

interface Props {
    state: AppState;
    actions: typeof State.actions;
}

interface State {
    activePage: ActivePage;
}

enum ActivePage {
    Factory = "FACTORY",
    Settings = "SETTINGS",
}

function assertNever(x: never): never {
    throw new Error("Unexpected object: " + x);
}

class RawApp extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            activePage: ActivePage.Factory,
        };
    }

    componentDidMount() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown = (event: KeyboardEvent) => {
        if (event.key == 'Shift') {
            document.body.classList.add('shift-down');
        }
    }
    handleKeyUp = (event: KeyboardEvent) => {
        if (event.key == 'Shift') {
            document.body.classList.remove('shift-down');
        }
    }

    handleClickSettings: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        this.setState({
            activePage: ActivePage.Settings,
        });
    };

    handleClickGroup = (
        i: number,
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.preventDefault();
        this.setState({
            activePage: ActivePage.Factory,
        });
        this.props.actions.setActiveGroup(i);
    };

    handleClickAddGroup: React.MouseEventHandler<HTMLButtonElement> = event => {
        event.preventDefault();
        const defaultName = `Factory ${this.props.state.groups.length + 1}`;
        const name = prompt(
            "What do you want to name this group?",
            defaultName
        );
        if (!name || !name.trim()) {
            return;
        }
        this.props.actions.addGroup(name);
    };

    handleClickRemoveGroup = (
        i: number,
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.preventDefault();
        const group = this.props.state.groups[this.props.state.activeGroupIdx];
        if (confirm(`Are you sure you want to delete ${group.name}`)) {
            this.props.actions.removeGroup(i);
        }
    };

    renderNavbar = () => {
        const settingsActive = this.state.activePage === ActivePage.Settings;
        const factoryPills = this.props.state.groups.map((group, i) => {
            const cls =
                !settingsActive && this.props.state.activeGroupIdx === i
                    ? "btn btn-primary"
                    : "btn btn-secondary";

            return (
                <div className="btn-group mr-2" role="group" key={i}>
                    <button
                        type="button"
                        className={cls}
                        onClick={this.handleClickGroup.bind(null, i)}
                    >
                        {group.name}
                    </button>
                    <button
                        type="button"
                        className="btn btn-danger"
                        title="Remove this group"
                        onClick={this.handleClickRemoveGroup.bind(null, i)}
                    >
                        ✖
                    </button>
                </div>
            );
        });
        const settingsCls = settingsActive
            ? "btn btn-primary"
            : "btn btn-secondary";

        return (
            <nav className="navbar">
                <div
                    className="btn-toolbar"
                    role="toolbar"
                    aria-label="Toolbar with button groups"
                >
                    {factoryPills}
                    <button
                        type="button"
                        className="btn btn-secondary mr-2"
                        title="Add a factory"
                        onClick={this.handleClickAddGroup}
                    >
                        +
                    </button>
                    <button
                        type="button"
                        className={settingsCls}
                        onClick={this.handleClickSettings}
                    >
                        Settings
                    </button>
                </div>
            </nav>
        );
    };

    renderFactory = () => {
        const group = this.props.state.groups[this.props.state.activeGroupIdx];

        return (
            <div className="container">
                <RecipeGroup rows={group.rows} />
            </div>
        );
    };

    renderSettings = () => {
        return (
            <div className="container">
                <Settings />
            </div>
        );
    };

    render() {
        let body: JSX.Element;
        if (this.state.activePage === ActivePage.Factory) {
            body = this.renderFactory();
        } else if (this.state.activePage === ActivePage.Settings) {
            body = this.renderSettings();
        } else {
            return assertNever(this.state.activePage);
        }

        return (
            <>
                {this.renderNavbar()}
                {body}
            </>
        );
    }
}

export const App = withBoth(RawApp);
