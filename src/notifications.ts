import { Signal } from './signal';

export interface Notification {
  title: string;
  when: Date;
  body: React.ReactNode;
}

export const newNotification = new Signal<Notification>();

export function notify(notification: Notification): void {
  newNotification.dispatch(notification);
}

export function error(body: Error | React.ReactNode): void {
  let bodyText = body;
  if (body instanceof Error && body.stack) {
    bodyText = body.stack;
  }

  newNotification.dispatch({
    title: 'Error!',
    when: new Date(),
    body: bodyText,
  });
}
