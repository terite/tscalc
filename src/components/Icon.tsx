import * as React from "react";

import { Tooltip } from "./generic";

interface Props {
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

export class Icon extends React.Component<Props, State> {
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
        const x = -props.obj.icon_col * 32;
        const y = -props.obj.icon_row * 32;

        const divStyle = {
            display: "inline-block",
            backgroundPosition: `${x}px ${y}px`,
            width: "32px",
            height: "32px",
            ...props.style,
        };

        let icon = <div
            ref={this.iconRef}
            onClick={props.onClick}
            title={props.title}
            className="game-icon"
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
