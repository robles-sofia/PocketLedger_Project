import type { Metadata } from "next";

//Title shown on the browser tab: "Settings | PocketLedger"
export const metadata: Metadata = {
  title: "Settings",
};

//This layout does not change the page, it only shows the page inside it
export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}