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
  let bodyText: React.ReactNode;
  if (body instanceof Error) {
    bodyText = String(body.stack);
  } else {
    bodyText = body;
  }

  newNotification.dispatch({
    title: 'Error!',
    when: new Date(),
    body: bodyText,
  });
}
