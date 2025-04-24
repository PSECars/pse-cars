import type { Metadata } from "next";
import {Figtree} from "next/font/google";
import "./globals.css";
import {IconShoppingBag} from "@tabler/icons-react";
import Image from "next/image";

import Logo from "./assets/logo.webp"

// If loading a variable font, you don't need to specify the font weight
const figtree = Figtree({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "PSE Cars",
  description: "Official PSE Cars website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${figtree.className} antialiased bg-surface-primary text-font-primary`}
      >
      {/* NAVBAR */}
        <div className="flex flex-row w-full">
            <div className="fixed flex flex-row items-center justify-between w-full px-8 py-6 bg-surface-secondary text-font-primary border-b-2 border-b-outline-tertiary z-20">
                <Image src={Logo} alt="PSE Cars Logo" className="w-24 h-8" /> {/* TODO: Original aspect ratio */}
                <nav className="flex space-x-4">
                <a href="/cars" className="hover:text-font-secondary">Cars</a>
                <a href="/configurator" className="hover:text-font-secondary">Configurator</a>
                <a href="/world-drive" className="hover:text-font-secondary">WorldDrive</a>
                <a href="/merchandise" className="hover:text-font-secondary">Merchandise</a>
                <a href="/my-pse-car" className="hover:text-font-secondary">MyPSECar</a>
                </nav>
                <IconShoppingBag className={"text-font-secondary"} />
            </div>
        </div>
      <main>
        {children}
      </main>
      </body>
    </html>
  );
}
