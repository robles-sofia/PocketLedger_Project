import type { Metadata } from "next";

//Title shown on the browser tab: "Dashboard | PocketLedger"
export const metadata: Metadata = {
  title: "Dashboard",
};

//This layout does not change the page, it only shows the page inside it
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
