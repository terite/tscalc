import * as React from "react"

export class UnusedWell extends React.Component<React.HTMLAttributes<HTMLDivElement>, {}> {
    render () {
        return <div className="well" {...this.props} />
    }
}
