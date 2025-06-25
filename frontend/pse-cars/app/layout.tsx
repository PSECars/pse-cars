"use client";

import {Figtree} from "next/font/google";
import "./globals.css";
import {IconShoppingBag} from "@tabler/icons-react";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import CartSidebar from "@/components/merchandise/CartSidebar";

import Logo from "./assets/logo.webp"
import Link from "next/link";

// If loading a variable font, you don't need to specify the font weight
const figtree = Figtree({ subsets: ['latin'] })

// Note: Metadata export moved to a separate file since this is now a client component
// app/metadata.ts created with the metadata export if needed

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Cart functionality
  const { getCartItemCount } = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <html lang="en">
      <body
        className={`${figtree.className} antialiased bg-surface-primary text-font-primary`}
      >
      {/* NAVBAR */}
        <div className="flex flex-row w-full">
            <div className="fixed flex flex-row items-center justify-between w-full px-8 py-6 bg-surface-secondary text-font-primary border-b-2 border-b-outline-tertiary z-20">
                <Link href="/" className="hover:text-font-secondary"><Image src={Logo} alt="PSE Cars Logo" className="w-24 h-8" /></Link> {/* TODO: Original aspect ratio */}
                <nav className="flex space-x-4">
                <a href="/cars" className="hover:text-font-secondary">Cars</a>
                <a href="/configurator" className="hover:text-font-secondary">Configurator</a>
                <a href="/world-drive" className="hover:text-font-secondary">WorldDrive</a>
                <a href="/merchandise" className="hover:text-font-secondary">Merchandise</a>
                <a href="/my-pse-car" className="hover:text-font-secondary">MyPSECar</a>
                </nav>
                {/* Updated shopping bag icon with cart functionality */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="relative text-font-secondary hover:text-font-primary transition-colors"
                >
                  <IconShoppingBag />
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-font-primary text-surface-primary text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getCartItemCount()}
                    </span>
                  )}
                </button>
            </div>
        </div>
      <main>
        {children}
      </main>
      
      {/* Cart sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </body>
    </html>
  );
}