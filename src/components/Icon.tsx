import * as React from "react";

import { Tooltip } from "./generic";

import * as game from "../game";

import { withGame } from "../state";

interface Props {
    gameData: game.GameData;
    obj: { icon_row: number; icon_col: number };

    title?: string;
    onClick?(event: React.MouseEvent<HTMLDivElement, MouseEvent>): void;
    style?: React.CSSProperties;
    tooltip?: React.ReactNode;
    text?: string;
}

interface State {
    showTooltip: boolean;
}

class GameIcon extends React.Component<Props, State> {
    iconRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);
        this.iconRef = React.createRef();
        this.state = {
            showTooltip: false,
        };
    }

    handleMouseEnter = () => {
        if (this.props.tooltip && !this.state.showTooltip) {
            this.setState({
                showTooltip: true,
            });
        }
    }

    handleMouseLeave = () => {
        if (this.props.tooltip || this.state.showTooltip) {
            this.setState({
                showTooltip: false,
            });
        }
    }

    render() {
        const props = this.props;
        const gd = props.gameData;
        const x = -props.obj.icon_col * 32;
        const y = -props.obj.icon_row * 32;

        const divStyle = {
            display: "inline-block",
            backgroundImage: `url(assets/sprite-sheet-${gd.raw.sprites.hash}.png)`,
            backgroundPosition: `${x}px ${y}px`,
            width: "32px",
            height: "32px",
            ...props.style,
        };

        let icon = <div
            ref={this.iconRef}
            onClick={props.onClick}
            title={props.title}
            className={"game-icon"}
            style={divStyle}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
        >&nbsp;</div>;

        if (this.state.showTooltip) {
            icon = (
                <>
                    {icon}
                    <Tooltip children={this.props.tooltip} relativeTo={this.iconRef} />
                </>
            );
        }

        if (props.text) {
            icon = (
                <div style={{ lineHeight: "32px" }}>
                    {icon}
                    <span style={{ marginLeft: "9px" }}>{props.text}</span>
                </div>
            );
        }

        return icon;
    }
}

export const Icon = withGame(GameIcon);
