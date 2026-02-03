import { Lexend } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider"; // Simbol @ otomatis merujuk ke folder src
const lexend = Lexend({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${lexend.className} bg-[#022c22] text-white antialiased`}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}