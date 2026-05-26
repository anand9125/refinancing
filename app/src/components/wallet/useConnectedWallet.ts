"use client";
import { useWallet } from "@solana/wallet-adapter-react";

export function useConnectedWallet() {
  const { publicKey, connected, connecting } = useWallet();
  return {
    isConnected: connected && !!publicKey,
    isInitializing: connecting,
    address: publicKey?.toBase58() ?? null,
    publicKey: publicKey ?? null,
  };
}
