import { useEffect, useState } from 'react';

type PromiseState<T> =
  | Readonly<[undefined, undefined, 'pending']>
  | Readonly<[T, undefined, 'resolved']>
  | Readonly<[undefined, unknown, 'rejected']>;

const defaultState = [undefined, undefined, 'pending'] as const;

export function usePromise<T>(
  promiseFn: () => Promise<T>,
  dependencies: unknown[]
): PromiseState<T> {
  const [promiseState, setPromiseState] = useState<PromiseState<T>>(
    defaultState
  );

  useEffect(
    () => {
      let cancelled = false;
      const promise = promiseFn();
      setPromiseState(defaultState);

      promise.then(
        (value) => {
          if (!cancelled) setPromiseState([value, undefined, 'resolved']);
        },
        (reason) => {
          if (!cancelled) setPromiseState([undefined, reason, 'rejected']);
        }
      );

      return () => {
        cancelled = true;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dependencies
  );

  return promiseState;
}
