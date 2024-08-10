import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Web3ModalProvider from "./providers";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Capital Finance",
  description: "Built for diamond hands",
  icons: "/capital.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#effffc]`}>
        <Web3ModalProvider>
          <Navbar />
          {children}
          <Footer />
        </Web3ModalProvider>
      </body>
    </html>
  );
}
