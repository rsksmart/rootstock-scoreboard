import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "AIrdrop",
  description: "AirDrop Voting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastContainer/>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
