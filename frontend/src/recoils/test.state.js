import { atom, useRecoilState } from "recoil";

export const testAtom = atom({
  key: "test-atom",
  default: null,
});

export const useTestState = () => useRecoilState(testAtom);
