import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Header } from "@/app/Header"; // Asegúrense de que esta ruta sea la correcta
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Secure Campus IA",
  description: "Asistente académico inteligente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ClerkProvider envuelve toda la aplicación
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-[100dvh] antialiased overflow-hidden`}
      >
        <body className="h-full flex flex-col overflow-hidden">
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}