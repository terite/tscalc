import * as React from "react"

import {RecipeGroup} from "./RecipeGroup"
import {Settings} from "./Settings"

import {AppState, withState} from '../state'

interface Props {
    state: AppState
}

interface Page {
    name: string
    render: () => JSX.Element
}

interface State {
    pages: Page[]
    activePage: Page
}


class RawApp extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        const pages: Page[] = [];

        for (const group of this.props.state.groups) {
            pages.push({
                name: group.name,
                render: this.renderFactory
            });
        }

        pages.push({
            name: "Settings",
            render: this.renderSettings
        });

        this.state = {
            pages: pages,
            activePage: pages[0]
        }
    }

    renderNavbar = () => {
        const items = this.state.pages.map((page, i) => {
            const cls = page == this.state.activePage
                ? "nav-link active"
                : "nav-link";
            const handler = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
                event.preventDefault()
                this.setState({
                    activePage: page
                });
            };
            return (
                <li className="nav-item" key={i}>
                    <a href="" className={cls} onClick={handler}>{page.name}</a>
                </li>
            )
        })
        return (
            <nav className="navbar">
                <ul className="nav nav-pills">
                    {items}
                </ul>
            </nav>
        )
    }

    renderFactory = () => {
        const group = this.props.state.groups[this.props.state.activeGroupIdx];

        return (
            <div className="container">
                <RecipeGroup rows={group.rows} />
            </div>
        )

    }

    renderSettings = () => {
        return (
            <div className="container">
                <Settings />
            </div>
        )
    }

    render() {
        return (
            <>
                {this.renderNavbar()}
                {this.state.activePage.render()}
            </>
        )
    }
}

export const App = withState(RawApp);
