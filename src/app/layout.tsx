import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { MantineProvider, AppShellHeader, AppShellMain } from "@mantine/core";
import { Header } from "./components/Header";

import "./globals.css";
import '@mantine/carousel/styles.css';
import "@mantine/core/styles.css";
import { AppShell } from "./appshell";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider >
          <MantineProvider>
            <AppShell>
              <AppShellHeader>
                <Header />
              </AppShellHeader>
              <AppShellMain>{children}</AppShellMain>
            </AppShell>
          </MantineProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
