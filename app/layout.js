"use client";

import "./globals.css";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title></title>
        <meta
          name="description"
          content="Sistem perpustakaan modern berbasis Next.js"
        />
      </head>
      <body className="bg-gray-50 text-gray-900">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
