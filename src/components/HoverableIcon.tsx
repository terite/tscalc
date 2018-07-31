import * as React from "react";

import {BaseDisplayable} from "../game"


interface Props {
    onClick?: any
    obj: BaseDisplayable
}

export class HoverableIcon extends React.Component<Props, {}> {

    render() {
        const obj = this.props.obj;
        const x = -obj.icon_col * 32
        const y = -obj.icon_row * 32

        const divStyle = {
            display: "inline-block",
            backgroundImage: 'url(sprite-sheet-e7012179d05120e7cd90c4581faf0e6e.png)',
            backgroundPosition: `${x}px ${y}px`,
            width: "32px",
            height: "32px"
        };
        return <div style={divStyle} title={obj.niceName()} onClick={this.props.onClick}>&nbsp;</div>
    }

}
