"use client";

import { useState, useMemo, useCallback } from "react";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { PROGRAM_ID } from "@/lib/constants";
import { RefinanceOpportunity } from "@/types";
import IDL from "@/idl/refinance_router";

export type FlowStage =
  | "idle"
  | "overview"
  | "repay"
  | "withdraw"
  | "deposit"
  | "borrow"
  | "done"
  | "cancelled";

export interface FlowState {
  stage: FlowStage;
  loading: boolean;
  error: string | null;
  lastTxSig: string | null;
  opportunity: RefinanceOpportunity | null;
}

const INITIAL: FlowState = {
  stage: "idle",
  loading: false,
  error: null,
  lastTxSig: null,
  opportunity: null,
};

export function useRefinanceFlow() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [state, setState] = useState<FlowState>(INITIAL);

  const program = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = new AnchorProvider(connection, wallet as any, { commitment: "confirmed" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Program(IDL as any, provider);
  }, [connection, wallet]);

  const open = useCallback((opp: RefinanceOpportunity) => {
    setState({ ...INITIAL, stage: "overview", opportunity: opp });
  }, []);

  const close = useCallback(() => setState(INITIAL), []);

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const startRefinance = useCallback(async () => {
    if (!program || !wallet.publicKey || !state.opportunity) return;
    const opp = state.opportunity;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const collateralMint = new PublicKey(opp.position.collateralMint);
      const debtMint = new PublicKey(opp.position.debtMint);
      // Convert USD amounts to micro-USD (6-decimal USDC-equivalent) for on-chain tracking
      const collateralAmount = new BN(Math.round(opp.position.collateralAmountUsd * 1_000_000));
      const debtAmount = new BN(Math.round(opp.position.debtAmountUsd * 1_000_000));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sig: string = await (program.methods as any)
        .initiateRefinance(
          opp.position.protocol,
          opp.targetProtocol,
          collateralAmount,
          debtAmount
        )
        .accounts({
          user: wallet.publicKey,
          collateralMint,
          debtMint,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setState((s) => ({ ...s, loading: false, stage: "repay", lastTxSig: sig }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: parseError(e) }));
    }
  }, [program, wallet.publicKey, state.opportunity]);

  const advanceStep = useCallback(async () => {
    if (!program || !wallet.publicKey) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const methods = program.methods as any;
      const accts = { user: wallet.publicKey };
      let sig: string;
      let next: FlowStage;

      switch (state.stage) {
        case "repay":
          sig = await methods.confirmRepay().accounts(accts).rpc();
          next = "withdraw";
          break;
        case "withdraw":
          sig = await methods.confirmWithdraw().accounts(accts).rpc();
          next = "deposit";
          break;
        case "deposit":
          sig = await methods.confirmDeposit().accounts(accts).rpc();
          next = "borrow";
          break;
        case "borrow":
          sig = await methods.confirmBorrow().accounts(accts).rpc();
          next = "done";
          break;
        default:
          return;
      }

      setState((s) => ({ ...s, loading: false, stage: next, lastTxSig: sig }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: parseError(e) }));
    }
  }, [program, wallet.publicKey, state.stage]);

  const cancelRefinance = useCallback(async () => {
    if (!program || !wallet.publicKey) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sig: string = await (program.methods as any)
        .cancelRefinance()
        .accounts({ user: wallet.publicKey })
        .rpc();
      setState((s) => ({ ...s, loading: false, stage: "cancelled", lastTxSig: sig }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: parseError(e) }));
    }
  }, [program, wallet.publicKey]);

  return {
    ...state,
    open,
    close,
    clearError,
    startRefinance,
    advanceStep,
    cancelRefinance,
  };
}

function parseError(e: unknown): string {
  const msg = (e as { message?: string })?.message ?? String(e);
  if (msg.includes("6001") || msg.includes("SameProtocol")) return "Source and target protocol must be different.";
  if (msg.includes("6004") || msg.includes("WrongStep")) return "Wrong step — complete the previous step first.";
  if (msg.includes("User rejected") || msg.includes("rejected")) return "Transaction rejected by wallet.";
  if (msg.includes("0x1")) return "Insufficient SOL for transaction fees. Airdrop some devnet SOL first.";
  if (msg.includes("already in use")) return "A refinance session is already open. Cancel it first.";
  return msg.length > 120 ? msg.slice(0, 120) + "…" : msg;
}
