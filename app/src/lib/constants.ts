import { PublicKey } from "@solana/web3.js";

export const NETWORK = "devnet";
export const RPC_ENDPOINT = "https://api.devnet.solana.com";
export const PROGRAM_ID = new PublicKey("21FD2tKF2nG8TWdeQkm1PA5svKeE5fyqEtUPxg4khAsM");

// Devnet USDC mint (from spl-token-faucet.com)
export const USDC_DEVNET_MINT = new PublicKey("Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr");

// Protocol program IDs on devnet
export const KAMINO_PROGRAM_ID = new PublicKey("KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD");
export const MARGINFI_PROGRAM_ID = new PublicKey("MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA");

export const PROTOCOL_LABELS: Record<number, string> = {
  0: "Kamino",
  1: "MarginFi",
  2: "Solend",
};

export const PROTOCOL_COLORS: Record<number, string> = {
  0: "#6EE7B7",
  1: "#93C5FD",
  2: "#FCA5A5",
};

// Safety scores (static for V0 — updated with live data in V1)
export const PROTOCOL_SCORES: Record<number, number> = {
  0: 9.1,
  1: 8.4,
  2: 7.6,
};
