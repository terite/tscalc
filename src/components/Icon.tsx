import * as React from "react";

import { PopperHelper } from "./generic";

import * as game from "../game";

import { withGame } from "../state";

interface Props {
    gameData: game.GameData;
    obj: { icon_row: number; icon_col: number };

    title?: string;
    onClick?(): void;
    style?: React.CSSProperties;
    tooltip?: React.ReactNode;
    text?: string;
}

class GameIcon extends React.Component<Props, {}> {
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
        const divProps = {
            title: props.title,
            className: "game-icon",
            style: divStyle,
            onClick: props.onClick,
        };

        let icon;
        if (props.tooltip) {
            icon = (
                <PopperHelper
                    target={({ style }) => (
                        <div style={{ ...style, zIndex: 1070 }}>
                            {props.tooltip}
                        </div>
                    )}
                    options={{
                        placement: "right",
                        modifiers: {
                            offset: {
                                enabled: true,
                                offset: "0, 20",
                            },
                            preventOverflow: {
                                enabled: true,
                                boundariesElement: "window",
                            },
                        },
                    }}
                >
                    {({ controller }) => (
                        <div
                            {...divProps}
                            onMouseEnter={controller.show}
                            onMouseLeave={controller.hide}
                        >
                            &nbsp;
                        </div>
                    )}
                </PopperHelper>
            );
        } else {
            icon = <div {...divProps}>&nbsp;</div>;
        }

        if (props.text) {
            return (
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
