"use client";

import { createContext } from "react";
import { AppShell as AppShellBase } from "@mantine/core";
import { User, useUser } from "./hooks/useUser";

type AppContextType = {
  user: User | null;
  setUser: (user: User) => void;
};

export const AppContext = createContext<AppContextType>({ user: null, setUser: () => null });

export const AppShell = ({ children }: any) => {
  const { user, setUser } = useUser();

  return (
    <AppContext.Provider value={{ user, setUser }}>
      <AppShellBase header={{ height: 60 }}>{children}</AppShellBase>
    </AppContext.Provider>
  );
};
