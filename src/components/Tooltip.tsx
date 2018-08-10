// NOTE: This component requires React 16 or newer.

// Usage:
/*
<Position
    parent={<div>Parent element</div>}
    target={ (style) => (
        <div style={style}>Popper element</div>
    )}
    options={{
        placement : 'top'
    }}
/>
*/

import * as React from 'react'
import * as ReactDOM from 'react-dom';
import Popper from 'popper.js';

import {debounce, deepEqual} from '../util'

let {Component} = React

class Wrapper extends Component<{}, {}> {
    render(){
        return this.props.children
    }
}

interface TooltipController {
    show(): void
    hide(): void
}

interface TargetFn {
    (a: {
        style: React.CSSProperties
    }): React.ReactNode
}

interface ChildrenFn {
    (a: {
        controller: TooltipController
    }): React.ReactNode
}

interface TooltipProps {
    children: ChildrenFn
    target: TargetFn
    options: Popper.PopperOptions
}

type TooltipState = {
    showTooltip: boolean
    popperStyle: React.CSSProperties
}


export class Tooltip extends Component<TooltipProps, TooltipState> {

    popperInstance?: Popper

    parentWrapperEl: React.ReactInstance|null = null

    controller: TooltipController

    constructor(props: TooltipProps) {
        super(props)
        this.state = {
            showTooltip: false,
            popperStyle: {}
        }

        this.controller = {
            show: () => {
                if (this.state.showTooltip) return
                this.setState({showTooltip: true})
            },
            hide: () => {
                if (!this.state.showTooltip) return
                this.setState({
                    showTooltip: false,
                    popperStyle: {}
                })
            }
        }
    }

    _targetWrapperEl: React.ReactInstance|null = null
    get targetWrapperEl() {
        return this._targetWrapperEl
    }

    set targetWrapperEl(val) {
        this._targetWrapperEl = val
        if (val) {
            this.initPopper()
        } else {
            this.popperInstance!.disableEventListeners()
            this.popperInstance = undefined
        }
    }

    get targetNode() {
        if (!this.targetWrapperEl) return null
        return ReactDOM.findDOMNode(this.targetWrapperEl) as Element | null
    }

    get parentNode() {
        if (!this.parentWrapperEl) return null
        return ReactDOM.findDOMNode(this.parentWrapperEl) as Element | null
    }

    componentDidUpdate(){
        this.popperInstance && this.popperInstance.update()
    }

    componentWillUnmount() {
        this.popperInstance && this.popperInstance.destroy()
    }

    initPopper() {
        if (this.popperInstance) {
            console.error('popper already initialized')
        }
        let targetNode = this.targetNode
        if (!targetNode) {
            console.error('cannot init popper, no target')
            return
        }

        let parentNode = this.parentNode
        if (!parentNode) {
            console.error('cannot init popper, no parent')
            return
        }

        this.popperInstance = new Popper(
            parentNode, 
            targetNode, 
            {
                ...this.props.options, // Spread the options provided to the component
                modifiers : {
                    applyStyle: {enabled : false},
                    updateStateWithStyle: {
                        enabled : true,
                        fn : this.update,
                    }
                }
            }
        );
    }

    update = (data: Popper.Data) => {
        console.log('update', data)
        this.setStyle(data)
        return data; // Important! Return data to popper
    }

    setStyle = (data: Popper.Data) => {
        if ( !data || !data.offsets || !data.offsets.popper ) { return }

        // Typings for popper offsets is bugged
        const offsets = data.offsets.popper as Popper.Offset & {
            position: React.CSSProperties['position']
        }

        let newStyle = {
            position: offsets.position,
            top: `${offsets.top}px`,
            left: `${offsets.left}px`,
        }

        // let newStyle = data.styles as React.CSSProperties
        let oldStyle = this.state.popperStyle
        if (!deepEqual(oldStyle, newStyle)) {
            this.setState({popperStyle: newStyle})
        }
    }

    debSetStyle = debounce(10, this.setStyle)

    captureTarget = (el: React.ReactInstance|null) => {
        this.targetWrapperEl = el
    }

    captureParent = (el: React.ReactInstance|null) => {
        this.parentWrapperEl = el
    }

    render(){
        let tooltip: JSX.Element|null = null
        if (this.state.showTooltip) {
            tooltip = <Wrapper
                key={1}
                ref={this.captureTarget}>
                {this.props.target({
                    style: this.state.popperStyle
                })}
            </Wrapper>
        }
        return <>
            <Wrapper
                key={0}
                ref={this.captureParent}
            >
                {this.props.children({
                    controller: this.controller
                })}
            </Wrapper>
            {tooltip}
        </>
    }
}
