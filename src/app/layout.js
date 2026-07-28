import "./globals.css";

import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: {
    default: "Trading Journey",
    template: "%s | Trading Journey",
  },

  description:
    "A personal trading journal for tracking trades, performance, and trading habits.",

  applicationName: "Trading Journey",

  keywords: [
    "trading journal",
    "options trading",
    "trade tracker",
    "trading performance",
  ],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#020617",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}




