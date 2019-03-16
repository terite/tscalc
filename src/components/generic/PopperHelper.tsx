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

import * as React from "react";
import * as ReactDOM from "react-dom";
import Popper from "popper.js";
import debounce = require("lodash/debounce");

import { deepEqual } from "../../util";

const floaterRoot = document.getElementById("floater-root")!;

class Wrapper extends React.Component<{}, {}> {
    render() {
        return this.props.children;
    }
}

class FloaterWrapper extends React.Component<{}, {}> {
    el = document.createElement("div");

    componentDidMount() {
        floaterRoot.appendChild(this.el);
    }

    componentWillUnmount() {
        floaterRoot.removeChild(this.el);
    }

    render() {
        return ReactDOM.createPortal(this.props.children, this.el);
    }
}

interface TargetFn {
    (a: { style: React.CSSProperties }): React.ReactNode;
}

interface ChildrenFn {
    (a: { controller: PopperHelperController }): React.ReactNode;
}

interface PopperHelperProps {
    children: ChildrenFn;
    target: TargetFn;
    options: Popper.PopperOptions;
}

interface PopperHelperState {
    showFloater: boolean;
    popperStyle: React.CSSProperties;
};

class PopperHelperController {
    private helper: PopperHelper;
    constructor(helper: PopperHelper) {
        this.helper = helper;
    }

    get isShown() {
        return this.helper.state.showFloater;
    }

    set isShown(shown: boolean) {
        if (shown == this.helper.state.showFloater) {
            return;
        }
        this.helper.setState({ showFloater: shown });
    }

    show = () => {
        this.isShown = true;
    };
    hide = () => {
        this.isShown = false;
    };
    toggle = () => {
        this.isShown = !this.isShown;
    };
}

export class PopperHelper extends React.Component<
    PopperHelperProps,
    PopperHelperState
> {
    popperInstance?: Popper;
    parentWrapperEl: React.ReactInstance | null = null;
    controller: PopperHelperController;

    constructor(props: PopperHelperProps) {
        super(props);
        this.state = {
            showFloater: false,
            popperStyle: { display: "none" },
        };

        this.controller = new PopperHelperController(this);
    }

    _targetWrapperEl: React.ReactInstance | null = null;
    get targetWrapperEl() {
        return this._targetWrapperEl;
    }
    set targetWrapperEl(val) {
        this._targetWrapperEl = val;
        if (val) {
            this.initPopper();
        } else {
            this.cleanupPopper();
        }
    }

    get targetNode() {
        if (!this.targetWrapperEl) return null;
        return ReactDOM.findDOMNode(this.targetWrapperEl) as Element | null;
    }

    get parentNode() {
        if (!this.parentWrapperEl) return null;
        return ReactDOM.findDOMNode(this.parentWrapperEl) as Element | null;
    }

    // componentDidUpdate(){
    //     this.popperInstance && this.popperInstance.update()
    // }

    componentWillUnmount() {
        this.limitedSetStyle.cancel();
        this.cleanupPopper();
    }

    initPopper() {
        if (this.popperInstance) {
            console.error("popper already initialized");
        }
        const targetNode = this.targetNode;
        if (!targetNode) {
            console.error("cannot init popper, no target");
            return;
        }

        const parentNode = this.parentNode;
        if (!parentNode) {
            console.error("cannot init popper, no parent");
            return;
        }

        this.popperInstance = new Popper(parentNode, targetNode, {
            ...this.props.options, // Spread the options provided to the component
            modifiers: {
                ...this.props.options.modifiers,
                applyStyle: { enabled: false },
                updateStateWithStyle: {
                    enabled: true,
                    fn: this.update,
                },
            },
        });
    }

    cleanupPopper() {
        if (!this.popperInstance) {
            return;
        }
        this.popperInstance.disableEventListeners();
        this.popperInstance = undefined;
    }

    update = (data: Popper.Data) => {
        this.limitedSetStyle(data);
        return data; // Important! Return data to popper
    };

    setStyle = (data: Popper.Data) => {
        if (!data || !data.offsets || !data.offsets.popper) {
            return;
        }

        // @types are incorrect for offsets.popper
        // const offsets = data.offsets.popper as Popper.Offset & {
        //     position: React.CSSProperties['position']
        // }

        // const newStyle = {
        //     position: offsets.position,
        //     top: `${offsets.top}px`,
        //     left: `${offsets.left}px`,
        // }

        const newStyle = data.styles as React.CSSProperties;
        const oldStyle = this.state.popperStyle;
        if (!deepEqual(oldStyle, newStyle)) {
            this.setState({ popperStyle: newStyle });
        }
    };

    limitedSetStyle = debounce(this.setStyle, 10);

    captureTarget = (el: React.ReactInstance | null) => {
        this.targetWrapperEl = el;
    };

    captureParent = (el: React.ReactInstance | null) => {
        this.parentWrapperEl = el;
    };

    render() {
        let floater: JSX.Element | null = null;
        if (this.state.showFloater) {
            floater = (
                <FloaterWrapper key={1} ref={this.captureTarget}>
                    {this.props.target({
                        style: this.state.popperStyle,
                    })}
                </FloaterWrapper>
            );
        }
        return (
            <>
                <Wrapper key={0} ref={this.captureParent}>
                    {this.props.children({
                        controller: this.controller,
                    })}
                </Wrapper>
                {floater}
            </>
        );
    }
}
