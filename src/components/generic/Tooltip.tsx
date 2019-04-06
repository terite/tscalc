import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Popper from 'popper.js';

interface Props {
    relativeTo: React.RefObject<HTMLElement>;
}

interface State {
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
            style: { zIndex: 1001 },
        };
    }

    popperUpdate = (data: Popper.Data) => {
        this.setState({
            style: data.styles as React.CSSProperties,
        });
        return data;
    };

    componentDidMount() {
        if (this.popperInstance) {
            throw new Error('Component mounted twice?');
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

    componentWillUnmount() {
        if (!this.popperInstance) {
            return;
        }
        this.popperInstance.disableEventListeners();
        this.popperInstance = null;
    }

    render() {
        return ReactDOM.createPortal(
            <div style={this.state.style} ref={this.selfRef}>
                {this.props.children}
            </div>,
            document.body
        );
    }
}
