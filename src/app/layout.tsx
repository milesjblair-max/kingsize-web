import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kingsize - Men's Big & Tall Clothing",
  description: "Fashion for the big & tall man",
};

import { Navigation } from "@/features/navigation/Navigation";
import { FitProvider } from "@/features/fit/FitContext";
import { AuthProvider } from "@/features/auth/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <FitProvider>
            <Navigation />
            {children}
          </FitProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
