import * as React from "react"

import {Tooltip} from './Tooltip'

import * as game from "../game"

import {withGame} from "../context"


type IconProps = {
    gameData: game.GameData
    obj: {icon_row: number, icon_col: number}

    text?: string
    title?: string
    onClick?(): void
    style?: React.CSSProperties
    tooltip?: JSX.Element
}

export const Icon = withGame((props: IconProps) => {
    const gd = props.gameData
    const x = -props.obj.icon_col * 32
    const y = -props.obj.icon_row * 32

    const divStyle = {
        display: "inline-block",
        backgroundImage: `url(sprite-sheet-${gd.raw.sprites.hash}.png)`,
        backgroundPosition: `${x}px ${y}px`,
        width: "32px",
        height: "32px",
        ...props.style
    };
    const divProps = {
        title: props.title,
        className: "icon",
        style: divStyle,
        onClick: props.onClick
    }

    let icon
    if (props.tooltip) {
        icon = (
            <Tooltip
                target={ ({style}) => (
                    <div style={style}>{props.tooltip}</div>
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
            {({controller}) => <div {...divProps}
                    onMouseEnter={controller.show}
                    onMouseLeave={controller.hide}>&nbsp;</div>
            }
            </Tooltip>
        )
    } else {
        icon = <div {...divProps}>&nbsp;</div>
    }

    if (props.text) {
        return (
            <div style={{lineHeight: "32px"}}>
                {icon}{props.text}
            </div>
        )
    } else {
        return icon
    }
})
