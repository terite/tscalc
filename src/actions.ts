import { useCallback } from 'react';
import { atom, useSetRecoilState } from 'recoil';

import { RecipeGroupData } from './state';
import { groupAtomsAtom } from './atoms';

let groupId = 0;

export interface AddGroupAction {
  (group: RecipeGroupData): void;
}
export const useGroupAdd = (): AddGroupAction => {
  const setGroupAtoms = useSetRecoilState(groupAtomsAtom);

  return useCallback(
    function (group: RecipeGroupData): void {
      setGroupAtoms((atoms) => [
        ...atoms,
        atom<RecipeGroupData>({
          key: `group-${++groupId}`,
          default: group,
        }),
      ]);
    },
    [setGroupAtoms]
  );
};
