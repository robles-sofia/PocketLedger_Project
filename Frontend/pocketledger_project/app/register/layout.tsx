import type { Metadata } from "next";

//Title shown on the browser tab: "Sign up | PocketLedger"
export const metadata: Metadata = {
  title: "Sign up",
};

//This layout does not change the page, it only shows the page inside it
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}