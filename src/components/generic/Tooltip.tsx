import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Popper from 'popper.js';

interface Props {
  relativeTo: React.RefObject<HTMLElement>;
  content: () => React.ReactNode;
}

interface State {
  showSelf: boolean;
}

const ontop: React.CSSProperties = { zIndex: 1001 };

export class Tooltip extends React.Component<Props, State> {
  selfRef: React.RefObject<any>;
  popperInstance: Popper | null;

  constructor(props: Props) {
    super(props);
    this.selfRef = React.createRef();
    this.popperInstance = null;
    this.state = {
      showSelf: false,
    };
  }

  shouldComponentUpdate(oldProps: Props, oldState: State): boolean {
    // universal props
    if (
      this.props.relativeTo !== oldProps.relativeTo ||
      this.state.showSelf !== oldState.showSelf
    ) {
      return true;
    }

    // Only re-render due to props.content changes if we're displaying that content
    return this.state.showSelf && this.props.content !== oldProps.content;
  }

  initPopper(): void {
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

  cleanupPopper(): void {
    if (this.popperInstance) {
      this.popperInstance.disableEventListeners();
      this.popperInstance = null;
    }
  }

  componentDidUpdate(_: Props, prevState: State): void {
    if (prevState.showSelf !== this.state.showSelf) {
      if (this.state.showSelf) {
        this.initPopper();
      } else {
        this.cleanupPopper();
      }
    }
  }

  componentDidMount(): void {
    const referenceEl = this.props.relativeTo.current;
    if (!referenceEl) {
      throw new Error('Invalid relativeTo');
    }

    referenceEl.addEventListener('mouseenter', this.handleMouseEnter);
    referenceEl.addEventListener('mouseleave', this.handleMouseLeave);
  }

  handleMouseEnter = (): void => {
    this.setState({
      showSelf: true,
    });
  };

  handleMouseLeave = (): void => {
    this.setState({
      showSelf: false,
    });
  };

  componentWillUnmount(): void {
    const referenceEl = this.props.relativeTo.current;
    if (referenceEl) {
      referenceEl.removeEventListener('mouseenter', this.handleMouseEnter);
      referenceEl.removeEventListener('mouseleave', this.handleMouseLeave);
    }
  }

  render(): React.ReactNode {
    if (!this.state.showSelf) {
      return null;
    }

    return ReactDOM.createPortal(
      <div style={ontop} ref={this.selfRef}>
        {this.props.content()}
      </div>,
      document.body
    );
  }
}
