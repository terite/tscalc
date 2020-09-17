import * as React from 'react';

import styles from './ErrorCatcher.module.css';

interface Props {}

interface State {
  crashMsg?: string;
}

export class ErrorCatcher extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      crashMsg: undefined,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Catch errors in any components below and re-render with error message
    this.crash(
      [
        'Component Stack:',
        errorInfo.componentStack,
        '',
        error && error.stack,
      ].join('\n')
    );
  }

  crash(msg: string): void {
    this.setState({
      crashMsg: msg,
    });
  }

  render(): React.ReactNode {
    if (typeof this.state.crashMsg !== 'undefined') {
      return (
        <div className={styles.crashed}>
          <h1>Crashed!</h1>
          <pre>{this.state.crashMsg}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
