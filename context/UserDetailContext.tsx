import { createContext, type Dispatch, type SetStateAction } from "react";
import type { UserDetail } from "@/lib/enroll-data";

export type UserDetailContextValue = {
  userDetail: UserDetail | undefined;
  setUserDetail: Dispatch<SetStateAction<UserDetail | undefined>>;
};

export const UserDetailContext = createContext<UserDetailContextValue>({
  userDetail: undefined,
  setUserDetail: () => {},
});
