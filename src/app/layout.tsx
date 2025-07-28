import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const font = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Eventora",
    description: "A modern event management platform",
    icons: {
        icon: "/mini-logo.svg",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${font.className} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
