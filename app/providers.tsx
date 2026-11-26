"use client";
import { useMemo, useEffect, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { 
  LedgerWalletAdapter, 
  PhantomWalletAdapter, 
  SolflareWalletAdapter
} from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [network, setNetwork] = useState<"mainnet" | "devnet">("mainnet");

  // قراءة الشبكة المختارة من localStorage عند التحميل، والاستماع لتغييرها
  useEffect(() => {
    const saved = localStorage.getItem("kntx_network") as "mainnet" | "devnet";
    if (saved === "devnet" || saved === "mainnet") setNetwork(saved);
    
    // مستمع لحدث تغيير الشبكة من Header
    const handleNetworkChange = (e: Event) => {
      const customEvent = e as CustomEvent<"mainnet" | "devnet">;
      setNetwork(customEvent.detail);
    };
    window.addEventListener("kntx-network-change", handleNetworkChange);
    return () => window.removeEventListener("kntx-network-change", handleNetworkChange);
  }, []);

  const endpoint = useMemo(() => {
    if (network === "devnet") {
      return "https://api.devnet.solana.com";
    }
    return process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";
  }, [network]);

  const wallets = useMemo(() => [
    new PhantomWalletAdapter(), 
    new SolflareWalletAdapter(), 
    new LedgerWalletAdapter()
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint} key={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}