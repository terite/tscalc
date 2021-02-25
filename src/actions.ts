import { useCallback } from 'react';
import { atom, useSetRecoilState } from 'recoil';

import { RecipeGroupData } from './state';
import { GroupAtom, groupAtomsAtom } from './atoms';

let groupId = 0;

export interface AddGroupAction {
  (group: RecipeGroupData): GroupAtom;
}
export const useGroupAdd = (): AddGroupAction => {
  const setGroupAtoms = useSetRecoilState(groupAtomsAtom);

  return useCallback(
    function (group: RecipeGroupData): GroupAtom {
      const newAtom: GroupAtom = atom<RecipeGroupData>({
        key: `group-${++groupId}`,
        default: group,
      });

      setGroupAtoms((atoms) => [...atoms, newAtom]);
      return newAtom;
    },
    [setGroupAtoms]
  );
};
