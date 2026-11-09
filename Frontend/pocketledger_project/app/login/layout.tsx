import type { Metadata } from "next";

//Title shown on the browser tab: "Log in | PocketLedger"
export const metadata: Metadata = {
  title: "Log in",
};

//This layout does not change the page, it only shows the page inside it
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
