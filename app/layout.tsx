import "./globals.css";
import { Sora } from "next/font/google";
import Providers from "./providers";

const sora = Sora({ subsets: ["latin"] });

export const metadata = { 
  title: "Kinetix Batch Pay · $KNTX", 
  description: "Decentralized non-custodial bulk payments on Solana",
  other: {
    google: "notranslate", // 👈 يمنع الترجمة التلقائية
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${sora.className} bg-slate-950 text-slate-100 antialiased selection:bg-purple-500 selection:text-white min-h-screen`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}