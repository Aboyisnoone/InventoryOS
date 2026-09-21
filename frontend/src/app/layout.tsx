import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ApolloWrapper } from "@/lib/apollo";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Inventory & Intelligence SaaS",
  description: "Manage your business inventory with Gemini AI Intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-50 text-slate-900 antialiased`}>
        <AuthProvider>
          <ApolloWrapper>
            {children}
          </ApolloWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
