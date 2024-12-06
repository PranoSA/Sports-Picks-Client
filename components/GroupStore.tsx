/**
 *
 * Zustand store for group data
 *
 */

import { create } from 'zustand';

type GroupStoreState = {
  adding_group: boolean;
};

export const useGroupStore = create<GroupStoreState>((set) => ({
  adding_group: false,
}));

export default useGroupStore;
