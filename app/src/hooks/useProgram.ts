"use client";

import { useMemo } from "react";
import { AnchorProvider, Program, type Idl } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import type { PerpDex } from "@/idl/perp_dex";
import idl from "@/idl/perp_dex.json";

export type PerpProgram = Program<PerpDex>;

// A throwaway pubkey for the read-only provider's wallet slot.
const DUMMY_KEY = new PublicKey("11111111111111111111111111111111");

/**
 * Returns an Anchor `Program` bound to the connected wallet, or `null` when no
 * wallet is connected. Use for instructions that need a signature.
 */
export function useProgram(): PerpProgram | null {
  const { connection } = useConnection();
  const wallet = useWallet();

  return useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions)
      return null;

    const provider = new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      },
      { commitment: "confirmed" }
    );

    return new Program(idl as Idl, provider) as unknown as PerpProgram;
  }, [
    connection,
    wallet.publicKey,
    wallet.signTransaction,
    wallet.signAllTransactions,
  ]);
}

/**
 * A read-only program instance that does not require a connected wallet. Used
 * for fetching market data, the orderbook, and global config on page load.
 */
export function useReadProgram(): PerpProgram {
  const { connection } = useConnection();

  return useMemo(() => {
    const provider = new AnchorProvider(
      connection,
      {
        publicKey: DUMMY_KEY,
        signTransaction: async <T,>(tx: T) => tx,
        signAllTransactions: async <T,>(txs: T[]) => txs,
      } as never,
      { commitment: "confirmed" }
    );
    return new Program(idl as Idl, provider) as unknown as PerpProgram;
  }, [connection]);
}
