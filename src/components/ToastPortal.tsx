import React from 'react';

import { newNotification, Notification } from '../notifications';

import { Toast } from './Toast';

import styles from './ToastPortal.module.css';

interface ShownToast extends Notification {
  key: number;
  handleClose(): void;
}

interface Props {}

interface State {
  toasts: ShownToast[];
}

let nextKey = 0;

export class ToastPortal extends React.Component<Props, State> {
  state: State = {
    toasts: [],
  };

  componentDidMount(): void {
    newNotification.addHandler(this.handleNotification);
  }

  componentWillUnmount(): void {
    newNotification.removeHandler(this.handleNotification);
  }

  handleNotification = (notification: Notification): void => {
    const toastPortal = this;
    const toast: ShownToast = {
      ...notification,
      key: nextKey++,
      handleClose() {
        toastPortal.setState(
          (state): State => {
            return {
              ...state,
              toasts: state.toasts.filter((n) => n.key !== toast.key),
            };
          }
        );
      },
    };
    this.setState(
      (state): State => {
        return {
          ...state,
          toasts: [...state.toasts, toast],
        };
      }
    );
  };

  renderToast = (toast: ShownToast): React.ReactNode => {
    return (
      <Toast
        key={toast.key}
        title={toast.title}
        when={toast.when}
        onClose={toast.handleClose}
      >
        {toast.body}
      </Toast>
    );
  };

  render(): React.ReactNode {
    return (
      <div aria-live="polite" aria-atomic="true" className={styles.ToastPortal}>
        {this.state.toasts.map(this.renderToast)}
      </div>
    );
  }
}
