import type { Metadata } from "next";

//Title shown on the browser tab: "Transactions | PocketLedger"
export const metadata: Metadata = {
  title: "Transactions",
};

//This layout does not change the page, it only shows the page inside it
export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
