import * as React from "react"

import * as game from "../game"


type Props = {
    gameData: game.GameData
    obj: {icon_row: number, icon_col: number}

    text?: string
    title?: string
    onClick?(): void
    style?: React.CSSProperties
}

export class Icon extends React.Component<Props, {}> {

    render() {
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
        let icon = (<div
            title={this.props.title}
            className="icon"
            style={divStyle}
            onClick={this.props.onClick}>&nbsp;</div>
        )

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
