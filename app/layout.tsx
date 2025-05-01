'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect } from 'react';
import { observeHeightChanges } from './utils/resizeUtils';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    observeHeightChanges();
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
} 