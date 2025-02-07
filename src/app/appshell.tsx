"use client";

import { createContext, useContext } from "react";
import { AppShell as AppShellBase } from "@mantine/core";
import { User, useUser } from "./hooks/useUser";

type UserContextType = {
  user: User | {};
  setUser: (user: any) => void;
};

export const AppContext = createContext<UserContextType>({ user: {}, setUser: () => null });

export const AppShell = ({ children }: any) => {
  const user = useUser();

  return (
    <AppContext.Provider value={{ user: user.user, setUser: user.setUser }}>
      <AppShellBase header={{ height: 60 }}>{children}</AppShellBase>
    </AppContext.Provider>
  );
};
