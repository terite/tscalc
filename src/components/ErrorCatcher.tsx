import * as React from 'react';
import * as Sentry from '@sentry/browser';

interface Props {}

interface State {
  crashMsg?: string;
}

export class ErrorCatcher extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      crashMsg: undefined,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Catch errors in any components below and re-render with error message
    this.crash(
      [
        'Component Stack:',
        errorInfo.componentStack,
        '',
        error && error.stack,
      ].join('\n')
    );

    Sentry.withScope((scope) => {
      Object.keys(errorInfo).forEach((key) => {
        scope.setExtra(key, errorInfo[key as keyof React.ErrorInfo]);
      });
      Sentry.captureException(error);
    });
  }

  crash(msg: string) {
    this.setState({
      crashMsg: msg,
    });
  }

  render() {
    if (typeof this.state.crashMsg !== 'undefined') {
      return (
        <div className="crashed">
          <h1>Crashed!</h1>
          <pre>{this.state.crashMsg}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
