import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

{/* TODO: Add p5js library & component */}
{/* TODO: make Footer component */}
{/* TODO: Navbar sticky? */}

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="min-h-full flex flex-col">
      <Navbar />
      {children}
    </div>
  );
}
