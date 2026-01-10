"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import "./globals.css";
import "leaflet/dist/leaflet.css";

import Sidebar from "./component/Sidebar";
import Navbar from "./component/Navbar";
import ChatBot from "./component/Chatbox";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BusProvider } from "./context/BusContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/" && pathname !== "/login") {
      router.push("/login");
    }

    // Admin route protection
    if (!isLoading && isAuthenticated && pathname.startsWith("/admin") && user?.role !== 'admin') {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold animate-pulse">Checking credentials...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Routes where the application shell (Sidebar, Navbar, ChatBot) should NOT be shown
  const isPublicRoute = pathname === "/" || pathname === "/login";

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <ProtectedRoute>
            <BusProvider>
              {isPublicRoute ? (
                <main className="min-h-screen">
                  {children}
                </main>
              ) : (
                <div className="flex h-screen overflow-hidden">
                  <Sidebar />
                  <div className="flex-1 flex flex-col min-w-0">
                    <Navbar />
                    <main className="flex-1 overflow-hidden relative">
                      {children}
                    </main>
                  </div>
                  <ChatBot />
                </div>
              )}
            </BusProvider>
          </ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
