import type { Metadata } from "next";

//Title shown on the browser tab: "Accounts | PocketLedger"
export const metadata: Metadata = {
  title: "Accounts",
};

//This layout does not change the page, it only shows the page inside it
export default function AccountsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
