import React from 'react';
// import { useRecoilValue, useSetRecoilState, RecoilState } from 'recoil';
import { useSetRecoilState, RecoilState } from 'recoil';

type PropsOf<
  T extends React.ComponentType<any>
> = T extends React.ComponentType<infer P> ? P : never;

type NoProp<T extends React.ComponentType<any>, P> = React.ComponentType<
  Pick<PropsOf<T>, Exclude<keyof PropsOf<T>, P>>
>;

// export const withRecoilValue = <
//   K extends string,
//   S,
//   T extends React.ComponentType<any>
// >(
//   OldComponent: T,
//   atom: RecoilState<S>,
//   propKey: K
// ): NoProp<T, K> => {
//   type NewProps = Omit<PropsOf<T>, K>;

//   const WrappedComponent: React.FC<NewProps> = (props: any) => {
//     const atomValue = useRecoilValue(atom);

//     return React.createElement(OldComponent, {
//       gameData: atomValue,
//       ...props,
//     });
//   };

//   return WrappedComponent;
// };

export const withSetRecoilState = <
  K extends string,
  S,
  T extends React.ComponentType<any>
>(
  OldComponent: T,
  atom: RecoilState<S>,
  propKey: K
): NoProp<T, K> => {
  type NewProps = Omit<PropsOf<T>, K>;

  const WrappedComponent: React.FC<NewProps> = (props: any) => {
    const setValue = useSetRecoilState(atom);

    return React.createElement(OldComponent, {
      [propKey]: setValue,
      ...props,
    });
  };

  return WrappedComponent;
};
