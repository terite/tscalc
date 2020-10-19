import React from 'react';

import styles from './ErrorCatcher.module.css';

interface Props {}

interface State {
  crashMsg: string | undefined;
}

export class ErrorCatcher extends React.Component<Props, State> {
  state: State = {
    crashMsg: undefined,
  };

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    return nextState.crashMsg !== this.state.crashMsg;
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Catch errors in any components below and re-render with error message
    this.setState({
      crashMsg: [
        'Component Stack:',
        errorInfo.componentStack,
        '',
        error && error.stack,
      ].join('\n'),
    });
  }

  render(): React.ReactNode {
    if (this.state.crashMsg) {
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
