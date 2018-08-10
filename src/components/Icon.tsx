import * as React from "react"

import {Tooltip} from './Tooltip'

import * as game from "../game"


type IconProps = {
    gameData: game.GameData
    obj: {icon_row: number, icon_col: number}

    text?: string
    title?: string
    onClick?(): void
    style?: React.CSSProperties
    tooltip?: JSX.Element
}

export class Icon extends React.Component<IconProps, {}> {

    divProps: any

    constructor(props: IconProps) {
        super(props)

        const gd = this.props.gameData
        const obj = this.props.obj;
        const x = -obj.icon_col * 32
        const y = -obj.icon_row * 32

        const divStyle = {
            display: "inline-block",
            backgroundImage: `url(sprite-sheet-${gd.raw.sprites.hash}.png)`,
            backgroundPosition: `${x}px ${y}px`,
            width: "32px",
            height: "32px",
            ...this.props.style
        };
        this.divProps = {
            title: this.props.title,
            className: "icon",
            style: divStyle,
            onClick: this.props.onClick
        }
    }

    render() {
        let icon
        if (this.props.tooltip) {
            icon = (
                <Tooltip
                    target={ ({style}) => (
                        <div style={style}>{this.props.tooltip}</div>
                    )}
                    options={{
                        placement : 'right',
                        modifiers: {
                            offset: {
                                offset: "0, 20"
                            },
                            preventOverflow: {
                                boundariesElement: "window"
                            }
                        }
                    }}>
                {({controller}) => <div {...this.divProps}
                        onMouseEnter={controller.show}
                        onMouseLeave={controller.hide}>&nbsp;</div>
                }
                </Tooltip>
            )
        } else {
            icon = <div {...this.divProps}>&nbsp;</div>
        }

        if (this.props.text) {
            return (
                <div style={{lineHeight: "32px"}}>
                    {icon}{this.props.text}
                </div>
            )
        } else {
            return icon
        }
    }

}
