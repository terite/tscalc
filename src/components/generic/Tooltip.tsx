import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Popper from 'popper.js';

interface Props {
    relativeTo: React.RefObject<HTMLElement>;
}

interface State {
    showSelf: boolean;
    style: React.CSSProperties;
}

export class Tooltip extends React.Component<Props, State> {
    selfRef: React.RefObject<any>;
    popperInstance: Popper | null;

    constructor(props: Props) {
        super(props);
        this.selfRef = React.createRef();
        this.popperInstance = null;
        this.state = {
            showSelf: false,
            style: { zIndex: 1001 },
        };
    }

    initPopper() {
        if (this.popperInstance) {
            return;
        }

        const referenceEl = this.props.relativeTo.current;
        if (!referenceEl) {
            throw new Error('Invalid relativeTo');
        }

        const selfEl = this.selfRef.current;
        if (!selfEl) {
            throw new Error('No self reference yet?');
        }

        this.popperInstance = new Popper(referenceEl, selfEl, {
            placement: 'right',
            modifiers: {
                offset: {
                    enabled: true,
                    offset: '0, 20',
                },
                preventOverflow: {
                    enabled: true,
                    boundariesElement: 'window',
                },
            },
        });
    }

    cleanupPopper() {
        if (this.popperInstance) {
            this.popperInstance.disableEventListeners();
            this.popperInstance = null;
        }
    }

    componentDidUpdate(_: Props, prevState: State) {
        if (prevState.showSelf !== this.state.showSelf) {
            if (this.state.showSelf) {
                this.initPopper();
            } else {
                this.cleanupPopper();
            }
        }
    }

    componentDidMount() {
        const referenceEl = this.props.relativeTo.current;
        if (!referenceEl) {
            throw new Error('Invalid relativeTo');
        }

        referenceEl.addEventListener('mouseenter', this.handleMouseEnter);
        referenceEl.addEventListener('mouseleave', this.handleMouseLeave);
    }

    handleMouseEnter = () => {
        this.setState({
            showSelf: true,
        });
    };

    handleMouseLeave = () => {
        this.setState({
            showSelf: false,
        });
    };

    componentWillUnmount() {
        const referenceEl = this.props.relativeTo.current;
        if (referenceEl) {
            referenceEl.removeEventListener(
                'mouseenter',
                this.handleMouseEnter
            );
            referenceEl.removeEventListener(
                'mouseleave',
                this.handleMouseLeave
            );
        }
    }

    render() {
        if (!this.state.showSelf) {
            return null;
        }

        return ReactDOM.createPortal(
            <div style={this.state.style} ref={this.selfRef}>
                {this.props.children}
            </div>,
            document.body
        );
    }
}
