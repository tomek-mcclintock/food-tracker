import { Inter } from "next/font/google";
import "./globals.css";
import './sw';
import BottomNav from "@/components/BottomNav";
import { AuthContextProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Food Sensitivity Tracker',
  description: 'Track your food and identify sensitivities',
  manifest: '/manifest.json',
  themeColor: '#3B82F6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Food Tracker',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Food Tracker" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <AuthContextProvider>
          <main className="container mx-auto p-4">
            {children}
          </main>
          <BottomNav />
        </AuthContextProvider>
      </body>
    </html>
  );
}