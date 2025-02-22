import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { MantineProvider, AppShellHeader, AppShellMain } from "@mantine/core";
import { Header } from "./components/Header";
import { AppShell } from "./appshell";

import "./globals.css";
import '@mantine/carousel/styles.css';
import '@mantine/charts/styles.css';
import "@mantine/core/styles.css";


export const metadata: Metadata = {
  title: "Pollee",
  description: "Poll for random stuff",
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
