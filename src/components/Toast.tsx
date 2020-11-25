import React, { useEffect } from 'react';

import { useRelativeTime } from '../util';

interface Props {
  title: string;
  when: Date;
  onClose(): void;
}

const AUTOHIDE_DELAY = 5000;

export const Toast: React.FC<Props> = ({ title, when, onClose, children }) => {
  useEffect(() => {
    const tId = setTimeout(() => {
      onClose();
    }, AUTOHIDE_DELAY);

    return () => {
      clearTimeout(tId);
    };
  }, [title, when, onClose, children]);

  const reltime = useRelativeTime(when);

  return (
    <div
      className="toast fade show"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="toast-header">
        <strong className="mr-auto">{title}</strong>
        <small>{reltime}</small>
        <button
          type="button"
          className="ml-2 mb-1 close"
          data-dismiss="toast"
          aria-label="Close"
          onClick={onClose}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div className="toast-body">{children}</div>
    </div>
  );
};
